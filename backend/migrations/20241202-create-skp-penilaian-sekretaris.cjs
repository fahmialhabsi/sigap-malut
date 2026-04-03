"use strict";

async function createTableIfMissing(queryInterface, Sequelize, table, def) {
  try {
    await queryInterface.createTable(table, def);
  } catch (err) {
    const m = String(err?.original?.message || err?.message || "");
    if (!/already exists/i.test(m)) throw err;
  }
}

async function addUniqueConstraintIfMissing(queryInterface, table, opts) {
  try {
    await queryInterface.addConstraint(table, opts);
  } catch (err) {
    const m = String(err?.original?.message || err?.message || "");
    if (!/already exists/i.test(m)) throw err;
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await createTableIfMissing(queryInterface, Sequelize, "skp_penilaian_sekretaris", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      periode_bulan: { type: Sequelize.SMALLINT, allowNull: false },
      periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
      penilai_id: { type: Sequelize.INTEGER, allowNull: false },
      yang_dinilai_id: { type: Sequelize.INTEGER, allowNull: false },
      jabatan_dinilai: {
        type: Sequelize.ENUM(
          "kasubag_umum_kepeg",
          "jf_perencanaan",
          "jf_keuangan",
          "jf_lainnya",
          "bendahara_pengeluaran",
          "bendahara_gaji",
          "bendahara_barang",
          "pelaksana_sekretariat",
        ),
        allowNull: false,
      },
      skor_skp: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_perilaku: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_output: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_disiplin: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      catatan_kualitatif: { type: Sequelize.TEXT, allowNull: true },
      skor_eksekusi_tugas: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_kualitas_dokumen: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_kepatuhan_alur: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_ketepatan_laporan: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      skor_total: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      kategori: {
        type: Sequelize.ENUM(
          "sangat_baik",
          "baik",
          "cukup",
          "kurang",
          "sangat_kurang",
        ),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("draft", "final"),
        allowNull: false,
        defaultValue: "draft",
      },
      finalized_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await addUniqueConstraintIfMissing(queryInterface, "skp_penilaian_sekretaris", {
      fields: ["periode_bulan", "periode_tahun", "penilai_id", "yang_dinilai_id"],
      type: "unique",
      name: "unique_periode_sekretaris",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("skp_penilaian_sekretaris");
  },
};
