import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateEnv } from "./validateEnv.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const serverEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serverEnvPath, override: false });

export const config = validateEnv(process.env);
