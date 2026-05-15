import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import { validEnv } from "./fixtures/env.js";

Object.assign(process.env, {
  ...validEnv,
  MONGODB_URI: "mongodb://127.0.0.1:27017/documind-ai-test",
  REFRESH_COOKIE_NAME: "documind_ai_refresh_token"
});

const mongoServer = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongoServer.getUri();

const { default: app } = await import("../src/app.js");
const { connectDatabase, disconnectDatabase } = await import("../src/config/database.js");
const { config } = await import("../src/config/env.js");
const { ChatMessage } = await import("../src/features/ai/chatMessage.model.js");
const { setAiTextProviderForTests } = await import("../src/features/ai/ai.provider.js");
const { Document } = await import("../src/features/documents/document.model.js");
const { User } = await import("../src/features/users/user.model.js");

function createMockProvider({ summary = "Mock summary", chunks = ["Mock", " answer"], onGenerate, onStream } = {}) {
  return {
    generateText: async (payload) => {
      onGenerate?.(payload);
      return {
        text: summary,
        usage: {
          input_tokens: 10,
          output_tokens: 5,
          total_tokens: 15
        }
      };
    },
    streamText: async function* streamText(payload) {
      onStream?.(payload);

      for (const chunk of chunks) {
        yield chunk;
      }
    }
  };
}

function parseSsePayload(payload) {
  return payload
    .trim()
    .split("\n\n")
    .filter(Boolean)
    .map((eventBlock) => {
      const lines = eventBlock.split("\n");
      const event = lines.find((line) => line.startsWith("event: "))?.slice(7);
      const data = lines.find((line) => line.startsWith("data: "))?.slice(6);

      return {
        event,
        data: data ? JSON.parse(data) : null
      };
    });
}

function sseRequest(pathname) {
  return request(app)
    .post(pathname)
    .buffer(true)
    .parse((response, callback) => {
      response.setEncoding("utf8");
      let body = "";

      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        callback(null, body);
      });
    });
}

async function registerUser(email = "ai.owner@example.com") {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "AI Owner",
      email,
      password: "Password123"
    })
    .expect(201);

  return {
    accessToken: response.body.data.accessToken,
    user: response.body.data.user
  };
}

async function createDocument(ownerId, overrides = {}) {
  return Document.create({
    owner: ownerId,
    title: "AI Source Document",
    originalName: "ai-source.pdf",
    mimeType: "application/pdf",
    fileSize: 1024,
    pageCount: 1,
    extractedText: "DocuMind helps users understand PDF documents.",
    textLength: 46,
    status: "ready",
    ...overrides
  });
}

test.before(async () => {
  await connectDatabase(process.env.MONGODB_URI);
});

test.after(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await ChatMessage.deleteMany({});
  await Document.deleteMany({});
  await User.deleteMany({});
  setAiTextProviderForTests(createMockProvider());
});

test("POST /api/ai/documents/:documentId/summary summarizes a truncated owned document and updates usage", async () => {
  const { accessToken, user } = await registerUser();
  const longText = `${"A".repeat(config.aiMaxDocumentChars)}SECRET_AFTER_LIMIT`;
  const document = await createDocument(user.id, {
    extractedText: longText,
    textLength: longText.length
  });
  let providerInput = "";

  setAiTextProviderForTests(createMockProvider({
    summary: "This is a bounded summary.",
    onGenerate(payload) {
      providerInput = payload.input;
      assert.equal(payload.maxOutputTokens, config.aiSummaryMaxOutputTokens);
    }
  }));

  const response = await request(app)
    .post(`/api/ai/documents/${document.id}/summary`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.summary, "This is a bounded summary.");
  assert.equal(response.body.data.context.documentTruncated, true);
  assert.equal(response.body.data.context.documentCharactersSent, config.aiMaxDocumentChars);
  assert.equal(response.body.data.usage.dailyCount, 1);
  assert.equal(providerInput.includes("SECRET_AFTER_LIMIT"), false);

  const updatedDocument = await Document.findById(document.id);
  assert.equal(updatedDocument.summary, "This is a bounded summary.");
  assert.ok(updatedDocument.summaryGeneratedAt);

  const updatedUser = await User.findById(user.id);
  assert.equal(updatedUser.aiUsage.dailyCount, 1);
});

test("AI endpoints enforce document ownership before calling the provider", async () => {
  const owner = await registerUser("owner@example.com");
  const other = await registerUser("other@example.com");
  const document = await createDocument(owner.user.id);
  let providerCalled = false;

  setAiTextProviderForTests(createMockProvider({
    onGenerate() {
      providerCalled = true;
    },
    onStream() {
      providerCalled = true;
    }
  }));

  await request(app)
    .post(`/api/ai/documents/${document.id}/summary`)
    .set("Authorization", `Bearer ${other.accessToken}`)
    .expect(404);

  await request(app)
    .post(`/api/ai/documents/${document.id}/chat`)
    .set("Authorization", `Bearer ${other.accessToken}`)
    .send({ message: "What is this about?" })
    .expect(404);

  assert.equal(providerCalled, false);
});

test("free user AI quota is enforced across summary and chat requests", async () => {
  const { accessToken, user } = await registerUser();
  const document = await createDocument(user.id);

  await request(app)
    .post(`/api/ai/documents/${document.id}/summary`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(200);

  await sseRequest(`/api/ai/documents/${document.id}/chat`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ message: "What does it say?" })
    .expect(200);

  const response = await request(app)
    .post(`/api/ai/documents/${document.id}/summary`)
    .set("Authorization", `Bearer ${accessToken}`)
    .expect(429);

  assert.match(response.body.message, /quota exceeded/);

  const updatedUser = await User.findById(user.id);
  assert.equal(updatedUser.aiUsage.dailyCount, config.aiFreeDailyQuota);
});

test("SSE chat streams chunks, stores chat history, and includes only bounded recent history", async () => {
  const { accessToken, user } = await registerUser();
  const document = await createDocument(user.id);

  for (let index = 1; index <= 5; index += 1) {
    await ChatMessage.create({
      owner: user.id,
      document: document.id,
      role: index % 2 === 0 ? "assistant" : "user",
      content: `history message ${index}`,
      estimatedTokens: 4
    });
  }

  let providerInput = "";

  setAiTextProviderForTests(createMockProvider({
    chunks: ["Answer ", "from ", "SSE"],
    onStream(payload) {
      providerInput = payload.input;
      assert.equal(payload.maxOutputTokens, config.aiChatMaxOutputTokens);
    }
  }));

  const response = await sseRequest(`/api/ai/documents/${document.id}/chat`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ message: "Summarize the latest point." })
    .expect(200)
    .expect("Content-Type", /text\/event-stream/);

  const events = parseSsePayload(response.body);

  assert.deepEqual(events.map((event) => event.event), ["ready", "chunk", "chunk", "chunk", "done"]);
  assert.equal(events.filter((event) => event.event === "chunk").map((event) => event.data.chunk).join(""), "Answer from SSE");
  assert.equal(events.at(-1).data.assistantMessage.content, "Answer from SSE");
  assert.equal(events.at(-1).data.context.historyMessagesSent, config.aiMaxChatHistoryMessages);
  assert.equal(providerInput.includes("history message 1"), false);
  assert.equal(providerInput.includes("history message 2"), false);
  assert.equal(providerInput.includes("history message 3"), true);
  assert.equal(providerInput.includes("Summarize the latest point."), true);

  const storedMessages = await ChatMessage.find({ owner: user.id, document: document.id }).sort({ createdAt: 1 });
  assert.equal(storedMessages.at(-2).role, "user");
  assert.equal(storedMessages.at(-2).content, "Summarize the latest point.");
  assert.equal(storedMessages.at(-1).role, "assistant");
  assert.equal(storedMessages.at(-1).content, "Answer from SSE");
});

test("GET /api/ai/documents/:documentId/messages returns owner-scoped chat history", async () => {
  const owner = await registerUser("owner@example.com");
  const other = await registerUser("other@example.com");
  const document = await createDocument(owner.user.id);

  await ChatMessage.create({
    owner: owner.user.id,
    document: document.id,
    role: "user",
    content: "What is DocuMind?",
    estimatedTokens: 4
  });

  const ownerResponse = await request(app)
    .get(`/api/ai/documents/${document.id}/messages`)
    .set("Authorization", `Bearer ${owner.accessToken}`)
    .expect(200);

  assert.equal(ownerResponse.body.data.messages.length, 1);
  assert.equal(ownerResponse.body.data.messages[0].content, "What is DocuMind?");

  await request(app)
    .get(`/api/ai/documents/${document.id}/messages`)
    .set("Authorization", `Bearer ${other.accessToken}`)
    .expect(404);
});

test("SSE chat aborts upstream work when the client disconnects", async () => {
  const { accessToken, user } = await registerUser();
  const document = await createDocument(user.id);
  let signalWasAborted = false;

  setAiTextProviderForTests({
    generateText: async () => ({ text: "unused" }),
    streamText: async function* streamText({ signal }) {
      yield "partial";

      await new Promise((resolve) => {
        if (signal.aborted) {
          signalWasAborted = true;
          resolve();
          return;
        }

        signal.addEventListener(
          "abort",
          () => {
            signalWasAborted = true;
            resolve();
          },
          { once: true }
        );

        setTimeout(resolve, 1500);
      });

      if (!signal.aborted) {
        yield " should not arrive";
      }
    }
  });

  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const body = JSON.stringify({ message: "Stream then disconnect." });
      const clientRequest = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: `/api/ai/documents/${document.id}/chat`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
          }
        },
        (response) => {
          response.on("data", () => {
            response.destroy();
            clientRequest.destroy();

            setTimeout(() => {
              server.close((error) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve();
              });
            }, 100);
          });
        }
      );

      clientRequest.on("error", (error) => {
        if (error.code !== "ECONNRESET") {
          reject(error);
        }
      });

      clientRequest.write(body);
      clientRequest.end();
    });
  });

  assert.equal(signalWasAborted, true);

  const assistantMessages = await ChatMessage.find({
    owner: user.id,
    document: document.id,
    role: "assistant"
  });

  assert.equal(assistantMessages.length, 0);
});
