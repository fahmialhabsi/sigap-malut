"use strict";

/**
 * Menyisipkan role organisasi per jabatan (GovTech hardening) bila belum ada.
 * Permission runtime: roleModuleMapping.json — kolom default_permissions di DB tetap [].
 */

const ROLES = [
  ["bendahara_pengeluaran", "Bendahara Pengeluaran", "Pengeluaran & SPJ sekretariat/UPT."],
  ["bendahara_gaji", "Bendahara Gaji", "Pengelolaan gaji/KGB terkait kepegawaian."],
  ["bendahara_barang", "Bendahara Barang", "Aset & barang persediaan (sek/UPT)."],
  ["kepala_bidang_ketersediaan", "Kepala Bidang Ketersediaan", "Pimpinan bidang ketersediaan pangan."],
  ["kepala_bidang_konsumsi", "Kepala Bidang Konsumsi", "Pimpinan bidang konsumsi & keamanan pangan."],
  ["fungsional_ketersediaan", "Fungsional Ketersediaan", "JF analisis/verifikasi ketersediaan."],
  ["fungsional_distribusi", "Fungsional Distribusi", "JF analisis/verifikasi distribusi."],
  ["fungsional_konsumsi", "Fungsional Konsumsi", "JF analisis/verifikasi konsumsi."],
  ["fungsional_perencanaan", "Fungsional Perencanaan", "JF perencanaan & renstra."],
  ["fungsional_keuangan", "Fungsional Keuangan", "JF analisis/penatausahaan keuangan (read-heavy)."],
  ["pelaksana_ketersediaan", "Pelaksana Ketersediaan", "Pelaksana teknis bidang ketersediaan."],
  ["pelaksana_distribusi", "Pelaksana Distribusi", "Pelaksana teknis bidang distribusi."],
  ["pelaksana_konsumsi", "Pelaksana Konsumsi", "Pelaksana teknis bidang konsumsi."],
  ["pelaksana_sekretariat", "Pelaksana Sekretariat", "Pelaksana teknis sekretariat."],
  ["kasubag_tu_uptd", "Kasubbag Tata Usaha UPTD", "TU & administrasi UPTD."],
  ["kasi_mutu", "Kasi Mutu (UPTD)", "Seksi mutu UPTD."],
  ["kasi_teknis", "Kasi Teknis (UPTD)", "Seksi teknis UPTD."],
  ["fungsional_uptd_mutu", "Fungsional Mutu UPTD", "JF mutu UPTD."],
  ["fungsional_uptd_teknis", "Fungsional Teknis UPTD", "JF teknis UPTD."],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") {
      console.warn("[20260410-insert-govtech-expansion-roles] Lewati: hanya PostgreSQL.");
      return;
    }

    for (const [code, name, description] of ROLES) {
      await queryInterface.sequelize.query(
        `INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
         SELECT gen_random_uuid(), $1::varchar(100), $2::text,
                (SELECT COALESCE(MAX(level), 0) + 1 FROM roles), $3::text, '[]'::json, true, NOW(), NOW()
         WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = $1::varchar(100))`,
        { bind: [code, name, description] },
      );
    }
  },

  async down() {
    // Tidak menghapus role — bisa memutus FK users.role_id
  },
};
