"use strict";

/** Tahap 6 — inti regulasi dinamis: versi, master hierarki, mapping sub kegiatan (idempotent). */

async function tableExists(qi, name) {
  const tables = await qi.showAllTables();
  return tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "regulasi_versi"))) {
      await queryInterface.createTable("regulasi_versi", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        nama_regulasi: { type: Sequelize.STRING(255), allowNull: false },
        nomor_regulasi: { type: Sequelize.STRING(128), allowNull: false },
        tahun: { type: Sequelize.INTEGER, allowNull: false },
        deskripsi: { type: Sequelize.TEXT, allowNull: true },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
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
      await queryInterface.addIndex("regulasi_versi", ["nomor_regulasi", "tahun"], {
        unique: true,
        name: "uq_regulasi_versi_nomor_tahun",
      });
    }

    if (!(await tableExists(queryInterface, "master_program"))) {
      await queryInterface.createTable("master_program", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        regulasi_versi_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "regulasi_versi", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        kode: { type: Sequelize.STRING(64), allowNull: false },
        nama: { type: Sequelize.STRING(512), allowNull: false },
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
      await queryInterface.addIndex("master_program", ["regulasi_versi_id", "kode"], {
        unique: true,
        name: "uq_master_program_versi_kode",
      });
    }

    if (!(await tableExists(queryInterface, "master_kegiatan"))) {
      await queryInterface.createTable("master_kegiatan", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        regulasi_versi_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "regulasi_versi", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        master_program_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "master_program", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        kode: { type: Sequelize.STRING(64), allowNull: false },
        nama: { type: Sequelize.STRING(512), allowNull: false },
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
      await queryInterface.addIndex("master_kegiatan", ["regulasi_versi_id", "master_program_id", "kode"], {
        unique: true,
        name: "uq_master_kegiatan_versi_prog_kode",
      });
    }

    if (!(await tableExists(queryInterface, "master_sub_kegiatan"))) {
      await queryInterface.createTable("master_sub_kegiatan", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        regulasi_versi_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "regulasi_versi", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        master_kegiatan_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "master_kegiatan", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        kode: { type: Sequelize.STRING(64), allowNull: false },
        nama: { type: Sequelize.STRING(512), allowNull: false },
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
        "master_sub_kegiatan",
        ["regulasi_versi_id", "master_kegiatan_id", "kode"],
        {
          unique: true,
          name: "uq_master_sub_kegiatan_versi_keg_kode",
        },
      );
    }

    if (!(await tableExists(queryInterface, "mapping_sub_kegiatan"))) {
      await queryInterface.createTable("mapping_sub_kegiatan", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        regulasi_versi_from_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "regulasi_versi", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        regulasi_versi_to_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "regulasi_versi", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        old_master_sub_kegiatan_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "master_sub_kegiatan", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        new_master_sub_kegiatan_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "master_sub_kegiatan", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        old_kode: { type: Sequelize.STRING(64), allowNull: true },
        new_kode: { type: Sequelize.STRING(64), allowNull: true },
        old_nama: { type: Sequelize.STRING(512), allowNull: true },
        new_nama: { type: Sequelize.STRING(512), allowNull: true },
        confidence_score: { type: Sequelize.DECIMAL(5, 4), allowNull: true },
        mapping_type: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "auto" },
        status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "pending" },
        match_reason: { type: Sequelize.STRING(64), allowNull: true },
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
        "mapping_sub_kegiatan",
        ["regulasi_versi_from_id", "regulasi_versi_to_id", "old_master_sub_kegiatan_id"],
        { name: "idx_mapping_sub_from_to_old" },
      );
    }
  },

  async down(queryInterface) {
    const order = [
      "mapping_sub_kegiatan",
      "master_sub_kegiatan",
      "master_kegiatan",
      "master_program",
      "regulasi_versi",
    ];
    for (const t of order) {
      if (await tableExists(queryInterface, t)) {
        await queryInterface.dropTable(t);
      }
    }
  },
};
