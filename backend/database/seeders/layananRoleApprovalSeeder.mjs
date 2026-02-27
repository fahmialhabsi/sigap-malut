import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath =
  process.env.DB_STORAGE ||
  path.resolve(__dirname, "..", "database", "database.sqlite");

function openDb(p) {
  return new sqlite3.Database(p);
}

function run(db, sql, params = []) {
  return new Promise((res, rej) =>
    db.run(sql, params, (err) => (err ? rej(err) : res())),
  );
}

async function seed() {
  const db = openDb(dbPath);
  try {
    // layanan sample
    await run(
      db,
      `INSERT OR IGNORE INTO layanan (id_layanan, kode_layanan, nama_layanan, modul_ui_id, bidang_penanggung_jawab) VALUES (?,?,?,?,?)`,
      [
        "LY_SYS_1",
        "komoditas",
        "Komoditas",
        "komoditas",
        "TIDAK_TERDOKUMENTASI",
      ],
    );
    // role sample
    await run(
      db,
      `INSERT OR IGNORE INTO role (id_role, role_key, display_name, permissions) VALUES (?,?,?,?)`,
      ["R_SUPER", "super_admin", "Super Admin", '["*"]'],
    );
    await run(
      db,
      `INSERT OR IGNORE INTO role (id_role, role_key, display_name, permissions) VALUES (?,?,?,?)`,
      ["R_STAF", "staf", "Staf", '["layanan:create","layanan:read"]'],
    );
    // approval_log sample (no fk enforcement if missing)
    await run(
      db,
      `INSERT INTO approval_log (layanan_id, requester_id, reviewer_id, action, comment, status) VALUES (?,?,?,?,?,?)`,
      ["LY_SYS_1", NULL, NULL, "seed", "initial approval log", "created"],
    );
    console.log("layanan/role/approval_log seeded (sample)");
  } catch (e) {
    console.error("Seeder error", e.message || e);
  } finally {
    db.close();
  }
}

seed();
