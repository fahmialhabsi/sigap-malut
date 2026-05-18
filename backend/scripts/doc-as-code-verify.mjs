// SIGAP-MALUT Doc-as-Code Verification Script
// Run: node scripts/doc-as-code-verify.mjs
// Requires: backend directory as cwd

import { readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(".");
const docRoot = resolve("..", "dokumenSistem");

let pass = 0, fail = 0;

function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${name}${detail ? " — " + detail : ""}`);
    fail++;
  }
}

function readFile(path) {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

console.log("\n🔍 SIGAP-MALUT Doc-as-Code Verification\n");

// Check 1: ENUM status count = 21
const taskModel = readFile(`${root}/models/Task.js`);
const enumLines = taskModel.split("\n").filter(l => /^\s+"[a-z_]+",/.test(l));
check("ENUM has 21 status values", enumLines.length === 21, `found ${enumLines.length}`);

// Check 2: No phantom endpoints in OpenAPI
const openapi = readFile(`${docRoot}/openapi.yaml`);
const forceClose = /^\s+\/api\/tasks\/\{id\}\/force-close:/m.test(openapi);
const reassign = /^\s+\/api\/tasks\/\{id\}\/reassign:/m.test(openapi);
check("No phantom force-close endpoint", !forceClose);
check("No phantom reassign endpoint", !reassign);

// Check 3: Guard not trusting req.body
const guard = readFile(`${root}/middleware/chainOfCommandGuard.js`);
const guardLines = guard.split("\n").filter(
  l => !/^\s*[/*]/.test(l) && /(sekretaris_disetujui|jf_diverifikasi)/.test(l)
);
check("Guard DB-backed (no req.body trust)", guardLines.length === 0, `found ${guardLines.length} suspicious lines`);

// Check 4: Public routes have no protect
const publicRoute = readFile(`${root}/routes/public.js`);
const protectCount = (publicRoute.match(/\bprotect\b/g) || []).length;
check("Public routes have no auth guard", protectCount === 0, `found ${protectCount} protect calls`);

// Check 5: Submit validator active
const submitVal = readFile(`${root}/utils/submitValidation.js`);
check("Submit validator (OUTPUT_TOO_SHORT) present", submitVal.includes("OUTPUT_TOO_SHORT"));

// Check 6: close.from does NOT include "verified"
const taskCtrl = readFile(`${root}/controllers/taskController.js`);
const closeIdx = taskCtrl.indexOf("close:");
const closeBlock = closeIdx > -1 ? taskCtrl.slice(closeIdx, closeIdx + 400) : "";
check("close.from does NOT include 'verified'", !closeBlock.includes('"verified"'));

// Check 7: All 5 guards exported
const exportedGuards = (guard.match(/^export\s+(async\s+)?function\s+\w+/gm) || []).length;
check("5 chain-of-command guards exported", exportedGuards === 5, `found ${exportedGuards}`);

// Check 8: TaskDiscussion model exists
const tdModel = readFile(`${root}/models/TaskDiscussion.js`);
check("TaskDiscussion model exists", tdModel.includes("task_discussions"));

// Check 9: InstruksiTindakLanjutPesan model exists
const itlModel = readFile(`${root}/models/InstruksiTindakLanjutPesan.js`);
check("InstruksiTindakLanjutPesan model exists", itlModel.includes("instruksi_tindak_lanjut_pesan"));

console.log(`\n${"─".repeat(50)}`);
console.log(`RESULT: ${pass} PASS, ${fail} FAIL`);
if (fail === 0) {
  console.log("✅ ALL CHECKS PASSED — SIGAP-MALUT doc-as-code verified\n");
  process.exit(0);
} else {
  console.log("❌ CHECKS FAILED — review above\n");
  process.exit(1);
}
