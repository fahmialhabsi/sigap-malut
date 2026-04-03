/**
 * Inti audit execution_thread_id — dipakai CLI thread:audit dan verify:govtech-final.
 * Lookup nama tabel: canonical + alias terurut, resolve via information_schema (deterministik).
 */
import "dotenv/config";

/** @param {string} name */
function quoteIdentPg(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

/**
 * @param {import("sequelize").Sequelize} sequelize
 * @param {string[]} candidates
 * @returns {Promise<{ resolved: string, matched_as: string } | null>}
 */
async function resolveTableName(sequelize, candidates) {
  for (const cand of candidates) {
    const name = String(cand);
    const [rows] = await sequelize.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables t
        WHERE t.table_schema = current_schema() AND t.table_name = :name
      ) AS ex`,
      { replacements: { name } },
    );
    const ex = rows?.[0]?.ex;
    if (ex === true || ex === "t") return { resolved: name, matched_as: name };
  }
  return null;
}

/**
 * Canonical module definitions (sumber kebenaran nama Sequelize / migrasi).
 * `aliases`: urutan fallback eksplisit setelah canonical pertama.
 */
export const THREAD_AUDIT_MODULES = [
  {
    module: "tasks",
    canonical: "Tasks",
    aliases: ["tasks"],
    column: "execution_thread_id",
    note: "task operasional",
    severity: "high",
    blocksGovtechFinal: true,
    enforcementKey: "THREAD_ENFORCEMENT_MODE",
  },
  {
    module: "surat_masuk",
    canonical: "surat_masuk",
    aliases: ["SuratMasuk"],
    column: "execution_thread_id",
    note: "surat masuk",
    severity: "high",
    blocksGovtechFinal: true,
    enforcementKey: null,
  },
  {
    module: "surat_keluar",
    canonical: "surat_keluar",
    aliases: ["SuratKeluar"],
    column: "execution_thread_id",
    note: "surat keluar",
    severity: "high",
    blocksGovtechFinal: true,
    enforcementKey: null,
  },
  {
    module: "spj",
    canonical: "spj",
    aliases: ["Spj"],
    column: "execution_thread_id",
    note: "SPJ",
    severity: "medium",
    blocksGovtechFinal: true,
    enforcementKey: null,
  },
  {
    module: "pengajuan_ke_gubernur",
    canonical: "pengajuan_ke_gubernur",
    aliases: ["PengajuanKeGubernur"],
    column: "execution_thread_id",
    note: "pengajuan gubernur",
    severity: "medium",
    blocksGovtechFinal: true,
    enforcementKey: null,
  },
];

function enforcementForRow(def) {
  if (def.enforcementKey) {
    return process.env[def.enforcementKey] || "off";
  }
  return "warn";
}

/**
 * Jalankan audit (tanpa console Sequelize). Caller bertanggung jawab close sequelize jika perlu.
 * @param {import("sequelize").Sequelize} sequelize
 */
export async function runThreadComplianceAuditInternal(sequelize) {
  const dialect = sequelize.getDialect();
  const mode = process.env.THREAD_ENFORCEMENT_MODE || "off";

  if (dialect !== "postgres") {
    return {
      ok: true,
      skipped: true,
      reason: "Hanya PostgreSQL — audit thread dilewati",
      compliance_ok: false,
      enforcement_mode: mode,
      checked_at: new Date().toISOString(),
      tables: [],
      summary: {
        total_rows: 0,
        null_thread: 0,
        high_severity_nulls: 0,
      },
      non_compliant_for_govtech: [],
    };
  }

  const out = {
    ok: true,
    skipped: false,
    compliance_ok: true,
    enforcement_mode: mode,
    checked_at: new Date().toISOString(),
    tables: [],
    summary: {
      total_rows: 0,
      null_thread: 0,
      high_severity_nulls: 0,
    },
    non_compliant_for_govtech: [],
  };

  for (const def of THREAD_AUDIT_MODULES) {
    const candidates = [def.canonical, ...(def.aliases || [])];
    const resolved = await resolveTableName(sequelize, candidates);
    const enf = enforcementForRow(def);

    if (!resolved) {
      if (def.blocksGovtechFinal) out.compliance_ok = false;
      out.tables.push({
        module: def.module,
        canonical_table: def.canonical,
        resolved_table: null,
        used_alias: false,
        skipped: true,
        skip_reason: "Tidak ada relasi di schema untuk kandidat: " + candidates.join(", "),
        column: def.column,
        note: def.note,
        severity: def.severity,
        enforcement: enf,
        blocks_govtech_final: def.blocksGovtechFinal,
      });
      continue;
    }

    const usedAlias = resolved.matched_as !== def.canonical;
    const tq = quoteIdentPg(resolved.resolved);
    const cq = quoteIdentPg(def.column);

    const [totalRows] = await sequelize.query(`SELECT COUNT(*)::int AS c FROM ${tq}`);
    const [nullRows] = await sequelize.query(
      `SELECT COUNT(*)::int AS c FROM ${tq} WHERE ${cq} IS NULL`,
    );

    const total = totalRows?.[0]?.c ?? 0;
    const nulls = nullRows?.[0]?.c ?? 0;

    out.summary.total_rows += total;
    out.summary.null_thread += nulls;
    if (def.severity === "high" && nulls > 0) out.summary.high_severity_nulls += nulls;

    const row = {
      module: def.module,
      canonical_table: def.canonical,
      resolved_table: resolved.resolved,
      used_alias: usedAlias,
      matched_as: resolved.matched_as,
      skipped: false,
      column: def.column,
      note: def.note,
      severity: def.severity,
      enforcement: enf,
      blocks_govtech_final: def.blocksGovtechFinal,
      total_rows: total,
      null_execution_thread_id: nulls,
      compliant_ratio: total ? Number(((1 - nulls / total) * 100).toFixed(2)) : 100,
    };

    if (nulls > 0) out.compliance_ok = false;

    out.tables.push(row);
  }

  if (out.summary.null_thread > 0) out.ok = false;
  if (!out.compliance_ok) out.ok = false;

  out.non_compliant_for_govtech = [
    ...out.tables
      .filter((t) => t.skipped && t.blocks_govtech_final)
      .map((t) => ({
        module: t.module,
        issue: "table_not_resolved",
        canonical_table: t.canonical_table,
        severity: t.severity,
      })),
    ...out.tables
      .filter((t) => !t.skipped && t.blocks_govtech_final && t.null_execution_thread_id > 0)
      .map((t) => ({
        module: t.module,
        issue: "orphan_null_thread",
        resolved_table: t.resolved_table,
        null_execution_thread_id: t.null_execution_thread_id,
        severity: t.severity,
      })),
  ];

  return out;
}

/**
 * Load Sequelize dengan log minimal (untuk stdout JSON bersih di CLI / verify).
 */
export async function loadSequelizeForAudit() {
  process.env.SEQUELIZE_LOGGING = process.env.SEQUELIZE_LOGGING || "false";
  process.env.SIGAP_SKIP_DB_DIALECT_LOG = "1";
  const { default: sequelize } = await import("../config/database.js");
  return sequelize;
}

export async function runThreadComplianceAudit() {
  const sequelize = await loadSequelizeForAudit();
  try {
    return await runThreadComplianceAuditInternal(sequelize);
  } finally {
    try {
      await sequelize.close();
    } catch {
      /* ignore */
    }
  }
}
