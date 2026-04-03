"use strict";

async function createTableIfMissing(queryInterface, Sequelize, table, def) {
  try {
    await queryInterface.createTable(table, def);
  } catch (err) {
    const m = String(err?.original?.message || err?.message || "");
    if (!/already exists/i.test(m)) throw err;
  }
}

async function addIndexIfMissing(queryInterface, table, fields, opts = {}) {
  try {
    await queryInterface.addIndex(table, fields, opts);
  } catch (err) {
    const m = String(err?.original?.message || err?.message || "");
    if (!/already exists/i.test(m)) throw err;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await createTableIfMissing(queryInterface, Sequelize, "notifikasi_sekretaris", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      jenis: {
        type: Sequelize.ENUM(
          "perintah_kadin_baru",
          "perintah_kadin_selesai",
          "approval_masuk_kasubag",
          "approval_masuk_jf",
          "approval_masuk_bendahara",
          "approval_masuk_bidang_uptd",
          "bypass_terdeteksi",
          "kgb_jatuh_tempo",
          "laporan_bidang_terlambat",
          "keputusan_kadin",
          "sppg_belum_input",
          "skp_deadline",
        ),
        allowNull: false,
      },
      judul: { type: Sequelize.STRING(255), allowNull: false },
      isi: { type: Sequelize.TEXT, allowNull: true },
      referensi_id: { type: Sequelize.INTEGER, allowNull: true },
      referensi_tabel: { type: Sequelize.STRING(100), allowNull: true },
      sudah_dibaca: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await addIndexIfMissing(queryInterface, "notifikasi_sekretaris", ["user_id", "sudah_dibaca"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notifikasi_sekretaris");
  },
};
