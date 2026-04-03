#!/usr/bin/env node
/**
 * Verifikasi akhir GovTech: migrasi, thread audit (wajib bersih), RBAC bendahara, build frontend (policy).
 *
 * Usage (dari folder backend): npm run verify:govtech-final
 *
 * Env:
 *   VERIFY_SKIP_FRONTEND=1       — jangan jalankan npm run build di frontend
 *   VERIFY_FRONTEND_BUILD=1      — jalankan build dengan VITE_DEMO_DATA=0
 *   GOVTECH_FRONTEND_REQUIRED=1  — default: tanpa build aktif → step frontend SKIP dan verifikasi FAIL
 *                                  set ke 0 untuk mengizinkan SKIP frontend tanpa FAIL (CI khusus)
 *   GOVTECH_ALLOW_NON_POSTGRES_THREAD_AUDIT=1 — izinkan lolos jika DB bukan Postgres (dev sqlite)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runThreadComplianceAudit } from "./threadComplianceAuditCore.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const repoRoot = path.join(backendRoot, "..");
const frontendRoot = path.join(repoRoot, "frontend");

const BENDAHARA_CODES = [
  "bendahara_pengeluaran",
  "bendahara_gaji",
  "bendahara_barang",
];

function run(cmd, cwd, inherit = true, envExtra = {}) {
  execSync(cmd, {
    cwd,
    stdio: inherit ? "inherit" : "pipe",
    shell: true,
    env: { ...process.env, ...envExtra },
  });
}

function readMatrix() {
  const p = path.join(backendRoot, "config", "roleModuleMapping.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** @param {"PASS"|"FAIL"|"SKIP"} status */
function step(name, status, detail) {
  const o = { name, status };
  if (detail !== undefined && detail !== null) o.detail = detail;
  return o;
}

async function main() {
  const report = {
    ok: true,
    result: "PASS",
    steps: [],
    failed_at: null,
    bendahara_rbac: {},
    thread_audit: null,
    non_compliant_for_govtech: [],
  };

  const fail = (name, detail) => {
    report.ok = false;
    report.result = "FAIL";
    if (!report.failed_at) report.failed_at = name;
    report.steps.push(step(name, "FAIL", detail));
  };

  const pass = (name, detail) => {
    report.steps.push(step(name, "PASS", detail));
  };

  const skip = (name, detail) => {
    report.steps.push(step(name, "SKIP", detail));
  };

  try {
    run("npm run db:verify", backendRoot);
    pass("db:verify");
  } catch (e) {
    fail("db:verify", String(e?.message || e));
    printReport(report);
    process.exit(1);
  }

  let audit;
  try {
    audit = await runThreadComplianceAudit();
    report.thread_audit = audit;
    report.non_compliant_for_govtech = audit.non_compliant_for_govtech || [];

    const allowNonPg = process.env.GOVTECH_ALLOW_NON_POSTGRES_THREAD_AUDIT === "1";
    if (audit.skipped && !allowNonPg) {
      fail("thread:audit", {
        reason: "Audit thread tidak dijalankan (non-PostgreSQL). Set GOVTECH_ALLOW_NON_POSTGRES_THREAD_AUDIT=1 untuk dev sqlite.",
        audit,
      });
    } else if (!audit.compliance_ok || audit.summary?.null_thread > 0) {
      fail("thread:audit", {
        reason: "Masih ada orphan / NULL execution_thread_id pada modul target atau tabel wajib tidak ter-resolve.",
        summary: audit.summary,
        non_compliant_for_govtech: audit.non_compliant_for_govtech,
        tables: audit.tables,
      });
    } else {
      pass("thread:audit", {
        summary: audit.summary,
        compliance_ok: audit.compliance_ok,
      });
    }
  } catch (e) {
    fail("thread:audit", String(e?.message || e));
  }

  try {
    const matrix = readMatrix();
    const roles = matrix.roles || {};
    for (const code of BENDAHARA_CODES) {
      const ok = !!roles[code]?.permissions?.length;
      report.bendahara_rbac[code] = ok ? "PASS" : "FAIL";
      if (!ok) report.ok = false;
    }
    const matrixOk = BENDAHARA_CODES.every((c) => report.bendahara_rbac[c] === "PASS");
    if (matrixOk) pass("bendahara_rbac_matrix", report.bendahara_rbac);
    else fail("bendahara_rbac_matrix", report.bendahara_rbac);
  } catch (e) {
    fail("bendahara_rbac_matrix", String(e?.message || e));
  }

  const frontendRequired = process.env.GOVTECH_FRONTEND_REQUIRED !== "0";
  const wantBuild =
    process.env.VERIFY_FRONTEND_BUILD === "1" && process.env.VERIFY_SKIP_FRONTEND !== "1";

  if (!wantBuild) {
    skip("frontend_build", {
      reason: "Build tidak dijalankan (VERIFY_FRONTEND_BUILD≠1 atau VERIFY_SKIP_FRONTEND=1).",
      hint: "Jalankan: VERIFY_FRONTEND_BUILD=1 npm run verify:govtech-final  (VITE_DEMO_DATA=0 otomatis)",
      frontend_required: frontendRequired,
    });
    if (frontendRequired) {
      report.ok = false;
      report.result = "FAIL";
      if (!report.failed_at) report.failed_at = "frontend_build";
    }
  } else if (!fs.existsSync(path.join(frontendRoot, "package.json"))) {
    skip("frontend_build", { reason: "Direktori frontend/ tidak ada", frontend_required: frontendRequired });
    if (frontendRequired) {
      report.ok = false;
      report.result = "FAIL";
      if (!report.failed_at) report.failed_at = "frontend_build";
    }
  } else {
    try {
      run("npm run build", frontendRoot, true, { VITE_DEMO_DATA: "0" });
      pass("frontend_build", { mode: "VITE_DEMO_DATA=0", note: "vite build selesai" });
    } catch (e) {
      fail("frontend_build", String(e?.message || e));
    }
  }

  if (!report.ok) {
    report.result = "FAIL";
  } else {
    report.result = "PASS";
  }

  printReport(report);
  process.exit(report.ok ? 0 : 1);
}

function printReport(report) {
  console.log("\n========== GOVTECH FINAL VERIFY ==========");
  console.log(JSON.stringify(report, null, 2));
  console.log("==========================================\n");
  console.log(`RESULT: ${report.result}`);
  if (report.failed_at) console.log("Failed at:", report.failed_at);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
