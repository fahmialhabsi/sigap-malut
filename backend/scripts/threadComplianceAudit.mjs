#!/usr/bin/env node
/**
 * Audit compliance execution_thread_id (PostgreSQL).
 * Jalankan dari folder backend: npm run thread:audit
 *
 * Exit 0 = selesai; exit 1 jika THREAD_AUDIT_STRICT=1 dan ada pelanggaran
 */
import { runThreadComplianceAudit } from "./threadComplianceAuditCore.mjs";

async function main() {
  const out = await runThreadComplianceAudit();
  console.log(JSON.stringify(out, null, 2));

  const strict = process.env.THREAD_AUDIT_STRICT === "1";
  if (strict && (!out.compliance_ok || out.summary?.null_thread > 0)) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
