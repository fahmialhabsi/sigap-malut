/**
 * Verifikasi jejak migrasi Sequelize CLI (tabel SequelizeMeta).
 * Tidak menjalankan migrasi — hanya membaca status untuk startup policy.
 */
import { QueryTypes } from "sequelize";

/** Nama file migrasi yang dianggap kritis untuk fitur thread & koordinasi horizontal. */
export const CRITICAL_SEQUELIZE_MIGRATIONS = [
  "20260406-execution-thread-id.cjs",
  "20260407-operational-modules-execution-thread.cjs",
  "20260409-horizontal-coordination-thread.cjs",
  "20260404-create-clarification-tables.cjs",
];

async function tableExistsPostgres(sequelize, tableName) {
  const safe = tableName.replace(/"/g, '""');
  const rows = await sequelize.query(
    `SELECT to_regclass(current_schema() || '."${safe}"') IS NOT NULL AS e`,
    { type: QueryTypes.SELECT },
  );
  return Boolean(rows[0]?.e);
}

async function tableExistsSqlite(sequelize, tableName) {
  const rows = await sequelize.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName.replace(/'/g, "''")}' LIMIT 1`,
    { type: QueryTypes.SELECT },
  );
  return rows.length > 0;
}

/**
 * @param {import("sequelize").Sequelize} sequelize
 * @returns {Promise<{ ok: boolean, metaTableExists: boolean, applied: string[], missingCritical: string[], message?: string }>}
 */
export async function verifyCliMigrationReadiness(sequelize) {
  const dialect = sequelize.getDialect();
  const metaTable = "SequelizeMeta";

  try {
    let metaExists = false;
    if (dialect === "postgres") {
      metaExists = await tableExistsPostgres(sequelize, metaTable);
    } else if (dialect === "sqlite") {
      metaExists = await tableExistsSqlite(sequelize, metaTable);
    } else {
      return {
        ok: true,
        metaTableExists: false,
        applied: [],
        missingCritical: [],
        message: `Dialect ${dialect}: pemeriksaan SequelizeMeta dilewati (tidak dikonfigurasi).`,
      };
    }

    if (!metaExists) {
      return {
        ok: false,
        metaTableExists: false,
        applied: [],
        missingCritical: [...CRITICAL_SEQUELIZE_MIGRATIONS],
        message:
          'Tabel "SequelizeMeta" tidak ada — migrasi CLI belum pernah dijalankan atau DB dibuat hanya lewat sync().',
      };
    }

    const rows = await sequelize.query(`SELECT name FROM "${metaTable}" ORDER BY name`, {
      type: QueryTypes.SELECT,
    });
    const applied = rows.map((r) => r.name).filter(Boolean);
    const set = new Set(applied);
    const missingCritical = CRITICAL_SEQUELIZE_MIGRATIONS.filter((m) => !set.has(m));

    return {
      ok: missingCritical.length === 0,
      metaTableExists: true,
      applied,
      missingCritical,
      message:
        missingCritical.length === 0
          ? null
          : `Migrasi kritis belum tercatat di SequelizeMeta: ${missingCritical.join(", ")}`,
    };
  } catch (err) {
    return {
      ok: false,
      metaTableExists: false,
      applied: [],
      missingCritical: [...CRITICAL_SEQUELIZE_MIGRATIONS],
      message: err?.message || String(err),
    };
  }
}
