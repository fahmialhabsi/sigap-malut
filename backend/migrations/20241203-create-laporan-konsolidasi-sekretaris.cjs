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
    await createTableIfMissing(queryInterface, Sequelize, "laporan_konsolidasi_sekretaris", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      periode_bulan: { type: Sequelize.SMALLINT, allowNull: false },
      periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
      jenis_laporan: {
        type: Sequelize.ENUM("bulanan", "triwulan", "semesteran", "tahunan"),
        allowNull: false,
      },
      ketersediaan_submitted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ketersediaan_submitted_at: { type: Sequelize.DATE, allowNull: true },
      distribusi_submitted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      distribusi_submitted_at: { type: Sequelize.DATE, allowNull: true },
      konsumsi_submitted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      konsumsi_submitted_at: { type: Sequelize.DATE, allowNull: true },
      uptd_submitted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      uptd_submitted_at: { type: Sequelize.DATE, allowNull: true },
      status: {
        type: Sequelize.ENUM(
          "menunggu_semua_unit",
          "siap_dikonsolidasi",
          "sedang_dikonsolidasi",
          "selesai_konsolidasi",
          "diteruskan_ke_kadin",
        ),
        allowNull: false,
        defaultValue: "menunggu_semua_unit",
      },
      dikerjakan_oleh: { type: Sequelize.INTEGER, allowNull: true },
      ringkasan_url: { type: Sequelize.STRING(500), allowNull: true },
      diteruskan_at: { type: Sequelize.DATE, allowNull: true },
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

    await addUniqueConstraintIfMissing(queryInterface, "laporan_konsolidasi_sekretaris", {
      fields: ["periode_bulan", "periode_tahun", "jenis_laporan"],
      type: "unique",
      name: "unique_periode_jenis",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("laporan_konsolidasi_sekretaris");
  },
};
