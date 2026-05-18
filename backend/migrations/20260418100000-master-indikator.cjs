"use strict";

/** Indikator per sub kegiatan (cascade UAT + regulasi dinamis). */

async function tableExists(qi, name) {
  const tables = await qi.showAllTables();
  return tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (await tableExists(queryInterface, "master_indikator")) {
      return;
    }
    if (!(await tableExists(queryInterface, "master_sub_kegiatan"))) {
      console.warn("[master-indikator] master_sub_kegiatan tidak ada, skip.");
      return;
    }

    await queryInterface.createTable("master_indikator", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      regulasi_versi_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "regulasi_versi", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      master_sub_kegiatan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "master_sub_kegiatan", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      kode: { type: Sequelize.STRING(64), allowNull: false },
      nama: { type: Sequelize.STRING(512), allowNull: false },
      satuan: { type: Sequelize.STRING(64), allowNull: true },
      dataset_key: { type: Sequelize.STRING(128), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "master_indikator",
      ["regulasi_versi_id", "master_sub_kegiatan_id", "kode"],
      {
        unique: true,
        name: "uq_master_indikator_versi_sub_kode",
      },
    );
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "master_indikator")) {
      await queryInterface.dropTable("master_indikator");
    }
  },
};
