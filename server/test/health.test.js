import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import { validEnv } from "./fixtures/env.js";

Object.assign(process.env, validEnv);

const { default: app } = await import("../src/app.js");

test("GET /api/health returns API and database health state", async () => {
  const response = await request(app)
    .get("/api/health")
    .expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.services.api, "up");
  assert.equal(response.body.services.database.state, "disconnected");
  assert.ok(response.body.uptime >= 0);
});

test("unknown routes return a consistent JSON error response", async () => {
  const response = await request(app)
    .get("/api/missing")
    .expect(404);

  assert.equal(response.body.success, false);
  assert.equal(response.body.statusCode, 404);
  assert.match(response.body.message, /Cannot GET \/api\/missing/);
});

