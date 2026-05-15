import assert from "node:assert/strict";
import test from "node:test";

import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import { validEnv } from "./fixtures/env.js";

Object.assign(process.env, {
  ...validEnv,
  REFRESH_COOKIE_NAME: "documind_test_refresh_token"
});

const mongoServer = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongoServer.getUri();

const { default: app } = await import("../src/app.js");
const { connectDatabase, disconnectDatabase } = await import("../src/config/database.js");
const { config } = await import("../src/config/env.js");
const { User } = await import("../src/features/users/user.model.js");
const {
  resetGoogleCredentialVerifierForTests,
  setGoogleCredentialVerifierForTests
} = await import("../src/features/auth/google.service.js");
const { verifyAccessToken } = await import("../src/features/auth/token.service.js");

function getRefreshCookie(response) {
  const setCookie = response.headers["set-cookie"];

  assert.ok(Array.isArray(setCookie), "expected response to set a cookie");
  return setCookie[0].split(";")[0];
}

function getRefreshCookieHeader(response) {
  const setCookie = response.headers["set-cookie"];

  assert.ok(Array.isArray(setCookie), "expected response to set a cookie");
  return setCookie[0];
}

function createUserPayload(overrides = {}) {
  return {
    name: "Aditi Sharma",
    email: "aditi@example.com",
    password: "Password123",
    ...overrides
  };
}

test.before(async () => {
  await connectDatabase(process.env.MONGODB_URI);
});

test.after(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  resetGoogleCredentialVerifierForTests();
  await User.deleteMany({});
});

test("POST /api/auth/register creates a local user, hashes password, returns access token, and sets an HttpOnly refresh cookie", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  const refreshCookieHeader = getRefreshCookieHeader(response);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "aditi@example.com");
  assert.equal(response.body.data.user.authProvider, "local");
  assert.equal(response.body.data.user.plan, "free");
  assert.ok(response.body.data.accessToken);
  assert.ok(refreshCookieHeader.includes(`${config.refreshCookieName}=`));
  assert.ok(refreshCookieHeader.includes("HttpOnly"));
  assert.ok(refreshCookieHeader.includes("SameSite=Lax"));
  assert.equal(refreshCookieHeader.includes("Secure"), false);

  const tokenPayload = verifyAccessToken(response.body.data.accessToken);
  assert.equal(tokenPayload.email, "aditi@example.com");
  assert.equal(tokenPayload.type, "access");

  const user = await User.findOne({ email: "aditi@example.com" }).select("+passwordHash +refreshTokens");

  assert.ok(user.passwordHash);
  assert.notEqual(user.passwordHash, "Password123");
  assert.equal(await user.comparePassword("Password123"), true);
  assert.equal(user.refreshTokens.length, 1);
});

test("POST /api/auth/register rejects duplicate emails", async () => {
  await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  const response = await request(app)
    .post("/api/auth/register")
    .send(createUserPayload({ name: "Another User" }))
    .expect(409);

  assert.equal(response.body.success, false);
  assert.match(response.body.message, /already exists/);
});

test("POST /api/auth/login authenticates valid credentials and rejects invalid passwords", async () => {
  await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  await request(app)
    .post("/api/auth/login")
    .send({ email: "aditi@example.com", password: "wrong-password" })
    .expect(401);

  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "aditi@example.com", password: "Password123" })
    .expect(200);

  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(getRefreshCookieHeader(response).includes("HttpOnly"));
});

test("GET /api/auth/me returns the current user for a valid access token", async () => {
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${registerResponse.body.data.accessToken}`)
    .expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "aditi@example.com");
});

test("GET /api/auth/me rejects missing or invalid access tokens", async () => {
  await request(app)
    .get("/api/auth/me")
    .expect(401);

  await request(app)
    .get("/api/auth/me")
    .set("Authorization", "Bearer invalid-token")
    .expect(401);
});

test("POST /api/auth/refresh rotates refresh tokens and detects reuse", async () => {
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  const originalRefreshCookie = getRefreshCookie(registerResponse);

  const refreshResponse = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", originalRefreshCookie)
    .expect(200);

  const newRefreshCookie = getRefreshCookie(refreshResponse);

  assert.notEqual(newRefreshCookie, originalRefreshCookie);
  assert.ok(refreshResponse.body.data.accessToken);

  let user = await User.findOne({ email: "aditi@example.com" }).select("+refreshTokens");
  assert.equal(user.refreshTokens.length, 1);

  const reuseResponse = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", originalRefreshCookie)
    .expect(401);

  assert.match(reuseResponse.body.message, /reuse detected/);

  user = await User.findOne({ email: "aditi@example.com" }).select("+refreshTokens");
  assert.equal(user.refreshTokens.length, 0);
});

test("POST /api/auth/logout clears the cookie and revokes the active refresh token", async () => {
  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send(createUserPayload())
    .expect(201);

  const refreshCookie = getRefreshCookie(registerResponse);

  const logoutResponse = await request(app)
    .post("/api/auth/logout")
    .set("Cookie", refreshCookie)
    .expect(200);

  assert.equal(logoutResponse.body.success, true);
  assert.ok(getRefreshCookieHeader(logoutResponse).includes(`${config.refreshCookieName}=`));

  const user = await User.findOne({ email: "aditi@example.com" }).select("+refreshTokens");
  assert.equal(user.refreshTokens.length, 0);

  await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", refreshCookie)
    .expect(401);
});

test("POST /api/auth/google creates or logs in a verified Google user", async () => {
  setGoogleCredentialVerifierForTests(async () => ({
    sub: "google-user-123",
    email: "google.user@example.com",
    email_verified: true,
    name: "Google User",
    picture: "https://example.com/avatar.png"
  }));

  const response = await request(app)
    .post("/api/auth/google")
    .send({ credential: "valid-google-id-token" })
    .expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.user.email, "google.user@example.com");
  assert.equal(response.body.data.user.authProvider, "google");
  assert.ok(response.body.data.accessToken);
  assert.ok(getRefreshCookieHeader(response).includes("HttpOnly"));

  const user = await User.findOne({ email: "google.user@example.com" }).select("+refreshTokens");
  assert.equal(user.googleId, "google-user-123");
  assert.equal(user.refreshTokens.length, 1);
});

test("POST /api/auth/google rejects unverified Google email payloads", async () => {
  setGoogleCredentialVerifierForTests(async () => ({
    sub: "google-user-123",
    email: "google.user@example.com",
    email_verified: false
  }));

  const response = await request(app)
    .post("/api/auth/google")
    .send({ credential: "valid-google-id-token" })
    .expect(401);

  assert.match(response.body.message, /could not be verified/);
});

