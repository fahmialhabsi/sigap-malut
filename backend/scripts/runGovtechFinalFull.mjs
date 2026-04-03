#!/usr/bin/env node
/**
 * Wrapper: set VERIFY_FRONTEND_BUILD=1 + GOVTECH_FRONTEND_REQUIRED=1 lalu jalankan verify:govtech-final.
 * Cocok untuk Windows tanpa Git Bash (env di-set oleh proses Node).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

const r = spawnSync(process.execPath, ["scripts/verifyGovtechFinal.mjs"], {
  cwd: backendRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    VERIFY_FRONTEND_BUILD: "1",
    GOVTECH_FRONTEND_REQUIRED: "1",
    VITE_DEMO_DATA: "0",
  },
});

process.exit(r.status ?? 1);
