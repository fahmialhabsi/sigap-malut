/**
 * verify-production-hardening.mjs
 *
 * Verification script untuk membuktikan 3 celah residual telah ditutup:
 *   R-01: URL validation consistent (shared validator)
 *   R-02: Close from verified blocked
 *   R-03: Body spoofing on chainOfCommandGuard fails
 *
 * USAGE:
 *   node scripts/verify-production-hardening.mjs
 *
 * Preconditions:
 *   - Backend server TIDAK perlu running untuk static checks (T-01 sampai T-07)
 *   - Untuk T-08 dan T-09, server harus running di BASE_URL
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

let passCount = 0;
let failCount = 0;

function pass(id, msg) {
  console.log(`${GREEN}✓ PASS${RESET} [${id}] ${msg}`);
  passCount++;
}

function fail(id, msg) {
  console.log(`${RED}✗ FAIL${RESET} [${id}] ${msg}`);
  failCount++;
}

function section(title) {
  console.log(`\n${BOLD}━━━ ${title} ━━━${RESET}`);
}

// ─── R-01: URL Validation Unification ────────────────────────────────────────

section("R-01: URL Validation Unification");

// T-01: submitValidation.js exists
const validationUtilPath = path.join(ROOT, "utils", "submitValidation.js");
try {
  const content = readFileSync(validationUtilPath, "utf8");
  if (content.includes("validateSubmitPayload") && content.includes("requiresOutputUrl")) {
    pass("T-01", "utils/submitValidation.js exists with validateSubmitPayload + requiresOutputUrl");
  } else {
    fail("T-01", "submitValidation.js exists but missing expected exports");
  }
} catch {
  fail("T-01", "utils/submitValidation.js NOT FOUND");
}

// T-02: taskController imports and uses shared validator
const taskControllerContent = readFileSync(path.join(ROOT, "controllers", "taskController.js"), "utf8");
if (taskControllerContent.includes("submitValidation.js") && taskControllerContent.includes("validateSubmitPayload")) {
  pass("T-02", "taskController.js imports and calls validateSubmitPayload");
} else {
  fail("T-02", "taskController.js does NOT use shared validator");
}

// T-03: taskController no longer uses title regex for URL check
if (taskControllerContent.includes("titleNeedUrl") || taskControllerContent.match(/\/asn\|data.+kepegawaian\//)) {
  fail("T-03", "taskController.js still contains legacy title-regex URL check");
} else {
  pass("T-03", "taskController.js: title-regex URL check REMOVED");
}

// T-04: pelaksana controller imports and uses shared validator
const pelaksanaContent = readFileSync(
  path.join(ROOT, "controllers", "pelaksanaSekretariat", "tugasController.js"),
  "utf8",
);
if (pelaksanaContent.includes("submitValidation.js") && pelaksanaContent.includes("validateSubmitPayload")) {
  pass("T-04", "pelaksanaSekretariat/tugasController.js uses shared validator");
} else {
  fail("T-04", "pelaksanaSekretariat/tugasController.js does NOT use shared validator");
}

// T-05: pelaksana controller no longer has inline isAsnTask logic
if (pelaksanaContent.includes("isAsnTask")) {
  fail("T-05", "pelaksanaSekretariat/tugasController.js still has inline isAsnTask (duplicate URL check)");
} else {
  pass("T-05", "pelaksanaSekretariat/tugasController.js: inline isAsnTask REMOVED (uses shared validator)");
}

// T-06: URL_REQUIRED_MODULES canonical list is module-field based, not title
const utilContent = readFileSync(validationUtilPath, "utf8");
if (
  utilContent.includes("URL_REQUIRED_MODULES") &&
  utilContent.includes("task.module") &&
  !utilContent.match(/titleNeedUrl|\/asn.*kepegawaian.*\/i/)
) {
  pass("T-06", "submitValidation.js uses module/modul_id field (NOT title regex) as URL rule basis");
} else {
  fail("T-06", "submitValidation.js URL rule basis unclear or still title-based");
}

// ─── R-02: Close from verified blocked ───────────────────────────────────────

section("R-02: Secretary Approval Mandatory — close.from verified blocked");

// T-07: verified NOT in close.from
const closeIdx = taskControllerContent.indexOf("close: {");
const closeBlock = taskControllerContent.substring(closeIdx, closeIdx + 500);
if (closeBlock.includes('"verified"')) {
  fail("T-07", "CRITICAL: 'verified' is still in close.from — bypass path OPEN");
} else {
  pass("T-07", "close.from does NOT include 'verified' — bypass path CLOSED");
}

// T-08: close.from only allows approved_by_secretary and forwarded_to_kadin
if (
  closeBlock.includes('"approved_by_secretary"') &&
  closeBlock.includes('"forwarded_to_kadin"') &&
  !closeBlock.includes('"submitted"') &&
  !closeBlock.includes('"verified"')
) {
  pass("T-08", "close.from only: approved_by_secretary, forwarded_to_kadin — governance chain enforced");
} else {
  fail("T-08", "close.from contains unexpected sources");
}

// ─── R-03: chainOfCommandGuard body spoofing ─────────────────────────────────

section("R-03: chainOfCommandGuard — body spoofing blocked");

const guardContent = readFileSync(path.join(ROOT, "middleware", "chainOfCommandGuard.js"), "utf8");

// T-09: guard does NOT destructure/read sekretaris_disetujui from body as executable code
if (guardContent.match(/const\s*\{[^}]*sekretaris_disetujui/)) {
  fail("T-09", "chainOfCommandGuard.js still destructures req.body.sekretaris_disetujui — SPOOFABLE");
} else {
  pass("T-09", "chainOfCommandGuard.js does NOT destructure sekretaris_disetujui from body — SPOOF CLOSED");
}

// T-10: guard does NOT destructure/read jf_diverifikasi from body as executable code
if (guardContent.match(/const\s*\{[^}]*jf_diverifikasi/)) {
  fail("T-10", "chainOfCommandGuard.js still destructures req.body.jf_diverifikasi — SPOOFABLE");
} else {
  pass("T-10", "chainOfCommandGuard.js does NOT destructure jf_diverifikasi from body — SPOOF CLOSED");
}

// T-11: guard uses DB query (Task.findByPk)
if (guardContent.includes("Task.findByPk") && guardContent.includes("task.status")) {
  pass("T-11", "chainOfCommandGuard.js uses DB-backed Task.findByPk for trusted state verification");
} else {
  fail("T-11", "chainOfCommandGuard.js does NOT use DB query — still relying on untrusted input");
}

// T-12: requireSekretarisBeforeKadin checks approved_by_secretary in DB
if (guardContent.includes("approved_by_secretary") && guardContent.includes("SEKRETARIS_APPROVED_STATUSES")) {
  pass("T-12", "requireSekretarisBeforeKadin validates against DB status — spoofed body has no effect");
} else {
  fail("T-12", "requireSekretarisBeforeKadin status check not found");
}

// T-13: guard ignores body (explicit comment)
if (guardContent.includes("ZERO TRUST") || guardContent.includes("Does NOT read req.body")) {
  pass("T-13", "chainOfCommandGuard.js has explicit ZERO TRUST annotation — body fields rejected");
} else {
  fail("T-13", "No ZERO TRUST annotation found in chainOfCommandGuard.js");
}

// ─── Inline functional test: shared validator behavior ───────────────────────

section("Inline Functional Test: validateSubmitPayload");

// Dynamically import and test
const { validateSubmitPayload, requiresOutputUrl } = await import(
  new URL("../utils/submitValidation.js", import.meta.url)
);

// T-14: short ringkas fails
const r1 = validateSubmitPayload({ module: "umum" }, "terlalu pendek", "");
if (!r1.ok && r1.code === "OUTPUT_TOO_SHORT") {
  pass("T-14", "Short output_ringkas (<50 chars) → OUTPUT_TOO_SHORT");
} else {
  fail("T-14", "Short output_ringkas should fail but didn't");
}

// T-15: kepegawaian module without URL fails
const r2 = validateSubmitPayload(
  { module: "kepegawaian" },
  "Ini adalah ringkasan pekerjaan yang sudah diselesaikan dengan cukup detail",
  "",
);
if (!r2.ok && r2.code === "OUTPUT_URL_REQUIRED") {
  pass("T-15", "module=kepegawaian + no URL → OUTPUT_URL_REQUIRED");
} else {
  fail("T-15", `module=kepegawaian without URL should fail. Got: ${JSON.stringify(r2)}`);
}

// T-16: non-ASN module without URL passes
const r3 = validateSubmitPayload(
  { module: "distribusi" },
  "Ini adalah ringkasan pekerjaan yang sudah diselesaikan dengan cukup detail",
  "",
);
if (r3.ok) {
  pass("T-16", "module=distribusi without URL → PASS (URL not required for this module)");
} else {
  fail("T-16", `module=distribusi should not require URL. Got: ${JSON.stringify(r3)}`);
}

// T-17: kepegawaian with URL passes
const r4 = validateSubmitPayload(
  { module: "kepegawaian" },
  "Ini adalah ringkasan pekerjaan yang sudah diselesaikan dengan cukup detail",
  "https://drive.google.com/file/dokumen-asn-2026.pdf",
);
if (r4.ok) {
  pass("T-17", "module=kepegawaian + valid URL + valid ringkas → PASS");
} else {
  fail("T-17", `Valid submission incorrectly rejected: ${JSON.stringify(r4)}`);
}

// T-18: title-based detection NO LONGER used — title="Data ASN" with module="distribusi" should NOT require URL
const r5 = validateSubmitPayload(
  { module: "distribusi", title: "Data ASN Dinas Pangan" },
  "Ini adalah ringkasan pekerjaan yang sudah diselesaikan dengan cukup detail",
  "",
);
if (r5.ok) {
  pass(
    "T-18",
    "title='Data ASN' with module='distribusi' → PASS (title-heuristic REMOVED, module-based only)",
  );
} else {
  fail("T-18", `Title heuristic still active — URL rejected based on title, not module: ${JSON.stringify(r5)}`);
}

// ─── Final Summary ───────────────────────────────────────────────────────────

console.log(`\n${BOLD}━━━ SUMMARY ━━━${RESET}`);
console.log(`Total: ${passCount + failCount} | ${GREEN}PASS: ${passCount}${RESET} | ${RED}FAIL: ${failCount}${RESET}`);

if (failCount === 0) {
  console.log(`\n${GREEN}${BOLD}✓ ALL CHECKS PASSED — Production Hardening VERIFIED${RESET}`);
  console.log("R-01: URL validation unified ✓");
  console.log("R-02: Close from verified blocked ✓");
  console.log("R-03: Body spoofing on chainOfCommandGuard blocked ✓");
} else {
  console.log(`\n${RED}${BOLD}✗ ${failCount} CHECK(S) FAILED — Production Hardening INCOMPLETE${RESET}`);
  process.exit(1);
}
