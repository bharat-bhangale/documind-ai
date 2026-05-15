import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MongoMemoryServer } from "mongodb-memory-server";
import PDFDocument from "pdfkit";
import request from "supertest";

import { validEnv } from "./fixtures/env.js";

const uploadRoot = await fs.mkdtemp(path.join(os.tmpdir(), "documind-uploads-"));

Object.assign(process.env, {
  ...validEnv,
  MONGODB_URI: "mongodb://127.0.0.1:27017/documind-documents-test",
  UPLOAD_DIR: uploadRoot,
  REFRESH_COOKIE_NAME: "documind_documents_refresh_token"
});

const mongoServer = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongoServer.getUri();

const { default: app } = await import("../src/app.js");
const { connectDatabase, disconnectDatabase } = await import("../src/config/database.js");
const { config } = await import("../src/config/env.js");
const { Document } = await import("../src/features/documents/document.model.js");
const { User } = await import("../src/features/users/user.model.js");

async function createPdfBuffer(text = "DocuMind PDF text") {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument();
    const chunks = [];

    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    pdf.text(text);
    pdf.end();
  });
}

async function createLargePdfBuffer() {
  let repeatCount = 100;
  let buffer = await createPdfBuffer("Large PDF content ".repeat(repeatCount));

  while (buffer.length <= config.freePlanMaxFileSizeBytes) {
    repeatCount += 100;
    buffer = await createPdfBuffer("Large PDF content ".repeat(repeatCount));
  }

  assert.ok(buffer.length < config.proPlanMaxFileSizeBytes);
  return buffer;
}

async function registerUser(email = "owner@example.com") {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Document Owner",
      email,
      password: "Password123"
    })
    .expect(201);

  return {
    accessToken: response.body.data.accessToken,
    user: response.body.data.user
  };
}

function uploadDocument(accessToken, { buffer, title, filename = "documind.pdf", contentType = "application/pdf" }) {
  const uploadRequest = request(app)
    .post("/api/documents/upload")
    .set("Authorization", `Bearer ${accessToken}`);

  if (title) {
    uploadRequest.field("title", title);
  }

  return uploadRequest.attach("file", buffer, { filename, contentType });
}

async function listTemporaryUploadFiles() {
  const documentsUploadDirectory = path.join(uploadRoot, "documents");

  try {
    return await fs.readdir(documentsUploadDirectory);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

test.before(async () => {
  await connectDatabase(process.env.MONGODB_URI);
});

test.after(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
  await fs.rm(uploadRoot, { recursive: true, force: true });
});

test.beforeEach(async () => {
  await Document.deleteMany({});
  await User.deleteMany({});
  await fs.rm(path.join(uploadRoot, "documents"), { recursive: true, force: true });
});

test("document upload extracts PDF text, cleans temporary files, and supports CRUD operations", async () => {
  const { accessToken } = await registerUser();
  const pdfBuffer = await createPdfBuffer("DocuMind document upload works.");

  const uploadResponse = await uploadDocument(accessToken, {
    buffer: pdfBuffer,
    title: "Project Brief"
  }).expect(201);

  const uploadedDocument = uploadResponse.body.data.document;

  assert.equal(uploadResponse.body.success, true);
  assert.equal(uploadedDocument.title, "Project Brief");
  assert.equal(uploadedDocument.originalName, "documind.pdf");
  assert.match(uploadedDocument.extractedText, /DocuMind document upload works/);
  assert.equal((await listTemporaryUploadFiles()).length, 0);

  const listResponse = await request(app)
    .get("/api/documents")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  assert.equal(listResponse.body.data.documents.length, 1);
  assert.equal(listResponse.body.data.pagination.total, 1);
  assert.equal(Object.hasOwn(listResponse.body.data.documents[0], "extractedText"), false);

  const detailResponse = await request(app)
    .get(`/api/documents/${uploadedDocument.id}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  assert.match(detailResponse.body.data.document.extractedText, /DocuMind document upload works/);

  const updateResponse = await request(app)
    .patch(`/api/documents/${uploadedDocument.id}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ title: "Updated Project Brief" })
    .expect(200);

  assert.equal(updateResponse.body.data.document.title, "Updated Project Brief");

  await request(app)
    .delete(`/api/documents/${uploadedDocument.id}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  await request(app)
    .get(`/api/documents/${uploadedDocument.id}`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(404);
});

test("document upload rejects non-PDF files", async () => {
  const { accessToken } = await registerUser();

  const response = await uploadDocument(accessToken, {
    buffer: Buffer.from("not a pdf"),
    filename: "notes.txt",
    contentType: "text/plain"
  }).expect(400);

  assert.match(response.body.message, /Only PDF files are allowed/);
});

test("document upload rejects invalid PDFs and cleans temporary files", async () => {
  const { accessToken } = await registerUser();

  await uploadDocument(accessToken, {
    buffer: Buffer.from("%PDF-not-a-real-pdf"),
    filename: "broken.pdf",
    contentType: "application/pdf"
  }).expect(422);

  assert.equal((await listTemporaryUploadFiles()).length, 0);
});

test("free users are limited by document count", async () => {
  const { accessToken } = await registerUser();
  const pdfBuffer = await createPdfBuffer("Small PDF for free plan limits.");

  for (let index = 1; index <= config.freePlanMaxDocuments; index += 1) {
    await uploadDocument(accessToken, {
      buffer: pdfBuffer,
      title: `Free Document ${index}`
    }).expect(201);
  }

  const response = await uploadDocument(accessToken, {
    buffer: pdfBuffer,
    title: "One Too Many"
  }).expect(403);

  assert.match(response.body.message, /Document limit reached/);
});

test("free users are limited by file size while pro users can upload within the pro limit", async () => {
  const { accessToken, user } = await registerUser();
  const largePdfBuffer = await createLargePdfBuffer();

  const freeResponse = await uploadDocument(accessToken, {
    buffer: largePdfBuffer,
    title: "Large Free PDF"
  }).expect(413);

  assert.match(freeResponse.body.message, /current plan limit/);

  await User.findByIdAndUpdate(user.id, { plan: "pro" });

  const proResponse = await uploadDocument(accessToken, {
    buffer: largePdfBuffer,
    title: "Large Pro PDF"
  }).expect(201);

  assert.equal(proResponse.body.data.document.title, "Large Pro PDF");
});

test("documents are isolated by owner", async () => {
  const owner = await registerUser("owner@example.com");
  const otherUser = await registerUser("other@example.com");
  const pdfBuffer = await createPdfBuffer("Private owner document.");

  const uploadResponse = await uploadDocument(owner.accessToken, {
    buffer: pdfBuffer,
    title: "Private Document"
  }).expect(201);

  const documentId = uploadResponse.body.data.document.id;

  await request(app)
    .get(`/api/documents/${documentId}`)
    .set("Authorization", `Bearer ${otherUser.accessToken}`)
    .expect(404);

  await request(app)
    .patch(`/api/documents/${documentId}`)
    .set("Authorization", `Bearer ${otherUser.accessToken}`)
    .send({ title: "Not Allowed" })
    .expect(404);

  await request(app)
    .delete(`/api/documents/${documentId}`)
    .set("Authorization", `Bearer ${otherUser.accessToken}`)
    .expect(404);

  const otherListResponse = await request(app)
    .get("/api/documents")
    .set("Authorization", `Bearer ${otherUser.accessToken}`)
    .expect(200);

  assert.equal(otherListResponse.body.data.documents.length, 0);
});

test("document listing supports empty and paginated result sets", async () => {
  const { accessToken, user } = await registerUser();

  const emptyResponse = await request(app)
    .get("/api/documents")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  assert.equal(emptyResponse.body.data.documents.length, 0);
  assert.equal(emptyResponse.body.data.pagination.total, 0);
  assert.equal(emptyResponse.body.data.pagination.totalPages, 0);

  await Document.insertMany(
    Array.from({ length: 12 }, (_value, index) => ({
      owner: user.id,
      title: `Document ${index + 1}`,
      originalName: `document-${index + 1}.pdf`,
      mimeType: "application/pdf",
      fileSize: 1000 + index,
      pageCount: 1,
      extractedText: `Extracted text ${index + 1}`,
      textLength: 16,
      status: "ready"
    }))
  );

  const paginatedResponse = await request(app)
    .get("/api/documents?page=2&limit=5")
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  assert.equal(paginatedResponse.body.data.documents.length, 5);
  assert.equal(paginatedResponse.body.data.pagination.page, 2);
  assert.equal(paginatedResponse.body.data.pagination.limit, 5);
  assert.equal(paginatedResponse.body.data.pagination.total, 12);
  assert.equal(paginatedResponse.body.data.pagination.totalPages, 3);
});

