import sequelize from "../../config/database.js";

// Master Komoditas Strategis
const komoditas = [
  {
    id: 1,
    nama: "Beras",
    kategori: "Padi-padian",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 2,
    nama: "Jagung",
    kategori: "Padi-padian",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 3,
    nama: "Kedelai",
    kategori: "Kacang-kacangan",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 4,
    nama: "Gula Pasir",
    kategori: "Gula",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 5,
    nama: "Minyak Goreng",
    kategori: "Minyak",
    satuan: "Liter",
    is_strategis: true,
  },
  {
    id: 6,
    nama: "Daging Sapi",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 7,
    nama: "Daging Ayam",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 8,
    nama: "Telur Ayam",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 9,
    nama: "Cabai Merah",
    kategori: "Sayuran",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 10,
    nama: "Bawang Merah",
    kategori: "Sayuran",
    satuan: "Kg",
    is_strategis: true,
  },
  {
    id: 11,
    nama: "Ikan Segar",
    kategori: "Protein Hewani",
    satuan: "Kg",
    is_strategis: false,
  },
  {
    id: 12,
    nama: "Tepung Terigu",
    kategori: "Tepung",
    satuan: "Kg",
    is_strategis: false,
  },
  {
    id: 13,
    nama: "Susu",
    kategori: "Produk Susu",
    satuan: "Liter",
    is_strategis: false,
  },
  {
    id: 14,
    nama: "Garam",
    kategori: "Bumbu",
    satuan: "Kg",
    is_strategis: false,
  },
];

// Kabupaten/Kota di Maluku Utara
const kabupaten = [
  { id: 1, nama: "Halmahera Barat", kode: "8201", ibu_kota: "Jailolo" },
  { id: 2, nama: "Halmahera Tengah", kode: "8202", ibu_kota: "Weda" },
  { id: 3, nama: "Kepulauan Sula", kode: "8203", ibu_kota: "Sanana" },
  { id: 4, nama: "Halmahera Selatan", kode: "8204", ibu_kota: "Labuha" },
  { id: 5, nama: "Halmahera Utara", kode: "8205", ibu_kota: "Tobelo" },
  { id: 6, nama: "Halmahera Timur", kode: "8206", ibu_kota: "Maba" },
  { id: 7, nama: "Pulau Morotai", kode: "8207", ibu_kota: "Daruba" },
  { id: 8, nama: "Pulau Taliabu", kode: "8208", ibu_kota: "Bobong" },
  { id: 9, nama: "Kota Ternate", kode: "8271", ibu_kota: "Ternate" },
  { id: 10, nama: "Kota Tidore Kepulauan", kode: "8272", ibu_kota: "Soasio" },
];

export async function seedMasterData() {
  console.log("🌱 Seeding master data...\n");

  try {
    const dialect = sequelize.getDialect();

    async function insertIfMissing(
      checkSql,
      checkParams,
      insertSql,
      insertParams,
    ) {
      const [rows] = await sequelize.query(checkSql, {
        replacements: checkParams,
      });
      const count =
        Array.isArray(rows) && rows.length > 0 ? Object.values(rows[0])[0] : 0;
      if (!count || Number(count) === 0) {
        await sequelize.query(insertSql, { replacements: insertParams });
        return true;
      }
      return false;
    }
    // Seed Komoditas
    console.log("📦 Seeding komoditas...");
    for (const item of komoditas) {
      const checkSql = `SELECT COUNT(*) as c FROM master_komoditas WHERE id = ?`;
      const insertSql = `INSERT INTO master_komoditas (id, nama, kategori, satuan, is_strategis, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(checkSql, [item.id], insertSql, [
        item.id,
        item.nama,
        item.kategori,
        item.satuan,
        item.is_strategis ? 1 : 0,
      ]);
    }
    console.log(`  ✅ ${komoditas.length} komoditas seeded\n`);

    // Seed Kabupaten
    console.log("🏙️  Seeding kabupaten...");
    for (const kab of kabupaten) {
      const checkSql = `SELECT COUNT(*) as c FROM master_kabupaten WHERE id = ?`;
      const insertSql = `INSERT INTO master_kabupaten (id, nama, kode, ibu_kota, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(checkSql, [kab.id], insertSql, [
        kab.id,
        kab.nama,
        kab.kode,
        kab.ibu_kota,
      ]);
    }
    console.log(`  ✅ ${kabupaten.length} kabupaten seeded\n`);

    console.log("✅ Master data seeding complete!\n");

    // --- Seed SA01 - kpi_tracking sample ---
    try {
      const kode = "C.1";
      const check = `SELECT COUNT(*) as c FROM kpi_tracking WHERE kpi_code = ?`;
      const insert = `INSERT INTO kpi_tracking (kpi_code, kpi_name, kategori, target_value, target_unit, current_value, status, periode, penanggung_jawab, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(check, [kode], insert, [
        kode,
        "Contoh KPI 1",
        "efisiensi_operasional",
        100,
        "persen",
        0,
        "pending",
        new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-\d{2}$/, "-01"),
        "Sekretariat",
      ]);
      console.log("  ✅ SA01 kpi_tracking sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA01 seed skipped:", e.message || e);
    }

    // --- Seed SA02 - dynamic_modules sample ---
    try {
      const mid = "DYN_SAMPLE";
      const check = `SELECT COUNT(*) as c FROM dynamic_modules WHERE module_id = ?`;
      const insert = `INSERT INTO dynamic_modules (module_id, module_name, table_name, description, icon, category, fields_definition, permissions, print_template, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(check, [mid], insert, [
        mid,
        "Sample Dynamic",
        "dynamic_sample",
        "Generated sample module",
        "puzzle-piece",
        "Lainnya",
        JSON.stringify([]),
        JSON.stringify({}),
        "simple_table",
        "draft",
        null,
      ]);
      console.log("  ✅ SA02 dynamic_modules sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA02 seed skipped:", e.message || e);
    }

    // --- Seed SA03 - tata_naskah_templates sample ---
    try {
      const tcode = "TPL_SAMPLE";
      const check = `SELECT COUNT(*) as c FROM tata_naskah_templates WHERE template_code = ?`;
      const insert = `INSERT INTO tata_naskah_templates (template_code, jenis_naskah, nama_template, deskripsi, kop_surat, template_content, footer, penandatangan_default, auto_numbering_format, placeholders, version, is_active, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(check, [tcode], insert, [
        tcode,
        "SK",
        "Sample Template",
        "Contoh template",
        "<h1>Kop</h1>",
        "<p>Isi</p>",
        "Footer",
        "kepala_dinas",
        "NO/YYYY",
        JSON.stringify([]),
        1,
        1,
        null,
      ]);
      console.log("  ✅ SA03 tata_naskah_templates sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA03 seed skipped:", e.message || e);
    }

    // --- Seed SA04 - peraturan sample ---
    try {
      const nomor = "001/2026";
      const check = `SELECT COUNT(*) as c FROM peraturan WHERE nomor_peraturan = ?`;
      const insert = `INSERT INTO peraturan (jenis_peraturan, nomor_peraturan, tahun, judul, ringkasan, status, download_count, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(check, [nomor], insert, [
        "Peraturan",
        nomor,
        2026,
        "Contoh Peraturan",
        "Ringkasan",
        "berlaku",
        0,
        null,
      ]);
      console.log("  ✅ SA04 peraturan sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA04 seed skipped:", e.message || e);
    }

    // --- Seed SA06 - audit_log placeholder ---
    try {
      const check = `SELECT COUNT(*) as c FROM audit_log`;
      const insert = `INSERT INTO audit_log (user_id, username, role, action, module, description, is_bypass, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      await insertIfMissing(check, [], insert, [
        null,
        "system",
        "system",
        "seed",
        "audit_log",
        "Initial seed",
        0,
      ]);
      console.log("  ✅ SA06 audit_log sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA06 seed skipped:", e.message || e);
    }

    // --- Seed SA07 - system_config defaults ---
    try {
      const cfgKey = "APP_NAME";
      const check = `SELECT COUNT(*) as c FROM system_config WHERE config_key = ?`;
      const insert = `INSERT INTO system_config (config_key, config_value, config_type, category, label, is_editable, is_sensitive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
      await insertIfMissing(check, [cfgKey], insert, [
        cfgKey,
        "SIGAP Malut",
        "string",
        "general",
        "Application Name",
        1,
        0,
      ]);
      console.log("  ✅ SA07 system_config default seeded");
    } catch (e) {
      console.error("  ⚠️  SA07 seed skipped:", e.message || e);
    }

    // --- Seed SA08 - backups placeholder ---
    try {
      const check = `SELECT COUNT(*) as c FROM backups`;
      const insert = `INSERT INTO backups (backup_type, backup_name, file_path, file_size, compression, database_name, status, is_encrypted, retention_days, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      await insertIfMissing(check, [], insert, [
        "manual",
        "initial_backup",
        "/backups/initial.zip",
        0,
        "gzip",
        "database",
        "completed",
        0,
        30,
        null,
      ]);
      console.log("  ✅ SA08 backups sample seeded");
    } catch (e) {
      console.error("  ⚠️  SA08 seed skipped:", e.message || e);
    }
    // Seed SA09 - compliance_tracking (sample/current month placeholder)
    console.log("📊 Seeding compliance_tracking (SA09) sample row...");
    try {
      await sequelize.query(
        `INSERT OR IGNORE INTO compliance_tracking (periode, total_transactions, bypass_count, bypass_percentage, compliance_percentage, target_compliance, status, bypass_details, top_violators, remedial_actions, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        {
          replacements: [
            // default sample periode: first day of current month
            new Date()
              .toISOString()
              .slice(0, 10)
              .replace(/-\d{2}$/, "-01"),
            0,
            0,
            0,
            100,
            100,
            "on_target",
            JSON.stringify([]),
            JSON.stringify([]),
            "",
          ],
        },
      );
      console.log("  ✅ compliance_tracking seeded (sample)\n");
    } catch (e) {
      console.error("  ⚠️  compliance_tracking seed skipped:", e.message || e);
    }

    // Seed SA10 - ai_config (default config)
    console.log("🤖 Seeding ai_config (SA10) default config...");
    try {
      await sequelize.query(
        `INSERT OR IGNORE INTO ai_config (ai_service, api_key, api_endpoint, model_name, temperature, max_tokens, features_enabled, classification_accuracy, total_requests, total_cost, monthly_budget, is_active, last_health_check, updated_by, created_at, updated_at)
         VALUES (?, NULL, NULL, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NULL, NULL, datetime('now'), datetime('now'))`,
        {
          replacements: [
            "openai",
            "gpt-4",
            0.5,
            1000,
            JSON.stringify([]),
            0,
            0,
            100,
            1,
          ],
        },
      );
      console.log("  ✅ ai_config seeded (default)\n");
    } catch (e) {
      console.error("  ⚠️  ai_config seed skipped:", e.message || e);
    }
  } catch (error) {
    console.error("❌ Master data seeding error:", error);
    throw error;
  }
}
