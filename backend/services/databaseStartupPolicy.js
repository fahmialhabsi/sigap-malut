/**
 * Kebijakan eksplisit: sequelize.sync vs migrasi CLI, dev vs production.
 * Lihat dokumenSistem/database-migration-deployment.md
 */
import SequelizePkg from "sequelize";
import {
  verifyCliMigrationReadiness,
  CRITICAL_SEQUELIZE_MIGRATIONS,
} from "./migrationReadinessService.js";

export function isProductionNodeEnv() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

/**
 * DB_SYNC_ON_BOOT:
 * - true/false eksplisit mengalahkan default.
 * - Default: production → false; development + postgres → false; development + sqlite → true.
 */
export function resolveDbSyncOnBoot() {
  const v = String(process.env.DB_SYNC_ON_BOOT ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  if (isProductionNodeEnv()) return false;
  const dialect = String(process.env.DB_DIALECT || "sqlite").toLowerCase();
  if (dialect === "postgres") return false;
  return true;
}

/**
 * DB_MIGRATION_REQUIRED: apakah memverifikasi SequelizeMeta + migrasi kritis.
 * Default: true jika production + postgres; selain itu false (hanya info opsional).
 */
export function resolveMigrationVerificationEnabled() {
  const v = String(process.env.DB_MIGRATION_REQUIRED ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  if (isProductionNodeEnv() && String(process.env.DB_DIALECT || "").toLowerCase() === "postgres") {
    return true;
  }
  return false;
}

/** DB_MIGRATION_STRICT: jika true, gap migrasi → process.exit(1). Default false (log keras saja). */
export function resolveMigrationStrict() {
  const v = String(process.env.DB_MIGRATION_STRICT ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(v);
}

/**
 * Patch kolom Tasks ad-hoc — hanya non-production kecuali diizinkan eksplisit (tidak disarankan).
 */
export function resolveDevSchemaPatchOnBoot() {
  if (isProductionNodeEnv()) {
    const v = String(process.env.DB_DEV_SCHEMA_PATCH_ON_BOOT ?? "").trim().toLowerCase();
    return ["1", "true", "yes", "on"].includes(v);
  }
  const v = String(process.env.DB_DEV_SCHEMA_PATCH_ON_BOOT ?? "").trim().toLowerCase();
  if (["0", "false", "no", "off"].includes(v)) return false;
  return true;
}

async function runDevTasksSchemaPatch(sequelize) {
  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable("Tasks");
    if (!table.sumber_perintah_kadin) {
      await qi.addColumn("Tasks", "sumber_perintah_kadin", {
        type: SequelizePkg.DataTypes.INTEGER,
        allowNull: true,
      });
      console.log("[DB] Dev patch: added Tasks.sumber_perintah_kadin");
    }
    if (!table.returned_by) {
      await qi.addColumn("Tasks", "returned_by", {
        type: SequelizePkg.DataTypes.INTEGER,
        allowNull: true,
      });
      console.log("[DB] Dev patch: added Tasks.returned_by");
    }
    if (!table.returned_at) {
      await qi.addColumn("Tasks", "returned_at", {
        type: SequelizePkg.DataTypes.DATE,
        allowNull: true,
      });
      console.log("[DB] Dev patch: added Tasks.returned_at");
    }
    if (!table.catatan_verifikasi) {
      await qi.addColumn("Tasks", "catatan_verifikasi", {
        type: SequelizePkg.DataTypes.TEXT,
        allowNull: true,
      });
      console.log("[DB] Dev patch: added Tasks.catatan_verifikasi");
    }
    if (!table.revisi_ke) {
      await qi.addColumn("Tasks", "revisi_ke", {
        type: SequelizePkg.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log("[DB] Dev patch: added Tasks.revisi_ke");
    }
  } catch (schemaErr) {
    console.warn("[DB] Dev schema patch skipped:", schemaErr?.message || schemaErr);
  }
}

/**
 * @param {import("sequelize").Sequelize} sequelize
 * @returns {Promise<{ syncRan: boolean, migrationCheck: object|null }>}
 */
export async function initDatabaseSchemaPolicy(sequelize) {
  const dialect = sequelize.getDialect();
  const nodeEnv = process.env.NODE_ENV || "development";

  console.log(`${"=".repeat(60)}`);
  console.log(`[DB] Startup schema policy`);
  console.log(`[DB] NODE_ENV=${nodeEnv} dialect=${dialect}`);
  console.log(`${"=".repeat(60)}`);

  const syncOn = resolveDbSyncOnBoot();
  if (syncOn) {
    console.log("[DB] DB_SYNC_ON_BOOT=enabled → menjalankan sequelize.sync()");
    if (dialect === "postgres") {
      console.warn(
        "[DB] Peringatan: sync() pada PostgreSQL dapat memicu ALTER TYPE / introspeksi ENUM — hindari di lingkungan bersama; utamakan migrasi CLI.",
      );
    }
    await sequelize.sync();
  } else {
    console.log("[DB] DB_SYNC_ON_BOOT=disabled → sequelize.sync() dilewati.");
    if (isProductionNodeEnv()) {
      console.log("[DB] Production: skema diharapkan dari migrasi CLI (SequelizeMeta) / pipeline deploy.");
    }
  }

  let migrationCheck = null;
  const verifyMigrations = resolveMigrationVerificationEnabled();
  const strict = resolveMigrationStrict();

  if (verifyMigrations && dialect === "postgres") {
    migrationCheck = await verifyCliMigrationReadiness(sequelize);
    if (migrationCheck.ok) {
      console.log("[DB] SequelizeMeta: OK; migrasi kritis terdaftar.");
    } else {
      console.warn(`[DB] SequelizeMeta / migrasi: ${migrationCheck.message || "cek gagal"}`);
      if (migrationCheck.missingCritical?.length) {
        console.warn(
          `[DB] Migrasi kritis yang diharapkan: ${CRITICAL_SEQUELIZE_MIGRATIONS.join(", ")}`,
        );
      }
      if (strict) {
        console.error("[DB] DB_MIGRATION_STRICT=1 → menghentikan startup karena gap migrasi.");
        process.exit(1);
      } else {
        console.warn(
          "[DB] Lanjut startup (non-strict). Set DB_MIGRATION_STRICT=true setelah pipeline migrasi stabil.",
        );
      }
    }
  } else if (dialect === "postgres" && !verifyMigrations) {
    console.log(
      "[DB] Pemeriksaan SequelizeMeta dinonaktifkan (DB_MIGRATION_REQUIRED=0 atau bukan prod default).",
    );
    const infoOff = ["0", "false", "off", "no"].includes(
      String(process.env.DB_MIGRATION_INFO ?? "true").trim().toLowerCase(),
    );
    if (!isProductionNodeEnv() && !infoOff) {
      const r = await verifyCliMigrationReadiness(sequelize);
      if (r.ok) {
        console.log("[DB] (dev info) SequelizeMeta & migrasi kritis: OK.");
      } else {
        console.log(`[DB] (dev info) Migrasi CLI: ${r.message || "periksa SequelizeMeta"}`);
        if (r.missingCritical?.length) {
          console.log(`[DB] (dev info) Belum terdaftar: ${r.missingCritical.join(", ")}`);
        }
      }
    }
  } else if (dialect === "sqlite") {
    console.log(
      "[DB] SQLite: jejak SequelizeMeta opsional; `npm run dev` sering mengandalkan sync atau skema SQL lokal.",
    );
    if (!syncOn) {
      console.log("[DB] Sync mati — pastikan berkas SQLite sudah berisi tabel yang dibutuhkan model.");
    }
  }

  if (resolveDevSchemaPatchOnBoot()) {
    console.log("[DB] DB_DEV_SCHEMA_PATCH_ON_BOOT: menjalankan patch kolom Tasks (dev/staging).");
    await runDevTasksSchemaPatch(sequelize);
  } else if (!isProductionNodeEnv()) {
    console.log("[DB] Patch dev Tasks dinonaktifkan (DB_DEV_SCHEMA_PATCH_ON_BOOT=off).");
  } else {
    console.log("[DB] Production: patch ad-hoc Tasks tidak dijalankan (gunakan migrasi).");
  }

  console.log(`${"=".repeat(60)}`);

  return { syncRan: syncOn, migrationCheck };
}
