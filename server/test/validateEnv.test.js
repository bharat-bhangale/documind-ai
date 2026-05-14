import assert from "node:assert/strict";
import test from "node:test";

import { validateEnv } from "../src/config/validateEnv.js";
import { validEnv } from "./fixtures/env.js";

test("validateEnv returns normalized config for valid environment values", () => {
  const config = validateEnv(validEnv);

  assert.equal(config.nodeEnv, "test");
  assert.equal(config.port, 5000);
  assert.equal(config.clientUrl, "http://localhost:5173");
  assert.equal(config.mongodbUri, "mongodb://127.0.0.1:27017/documind-test");
  assert.equal(config.aiModel, "gpt-4o-mini");
});

test("validateEnv fails fast when required variables are missing", () => {
  const envWithoutMongo = { ...validEnv };
  delete envWithoutMongo.MONGODB_URI;

  assert.throws(
    () => validateEnv(envWithoutMongo),
    /Environment validation failed/
  );
});

test("validateEnv rejects weak JWT secrets", () => {
  assert.throws(
    () => validateEnv({ ...validEnv, JWT_SECRET: "short" }),
    /JWT_SECRET/
  );
});
