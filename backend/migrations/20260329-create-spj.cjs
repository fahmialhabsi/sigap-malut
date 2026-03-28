"use strict";

/**
 * Migration: create spj table
 * Purpose: Surat Pertanggungjawaban (SPJ) — dibuat pelaksana, diverifikasi bendahara.
 * State machine: draft → submitted → verified | rejected
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("spj", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nomor_spj: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      judul: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      kegiatan: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      pelaksana_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      unit_kerja: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      tanggal_kegiatan: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_anggaran: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("draft", "submitted", "verified", "rejected"),
        allowNull: false,
        defaultValue: "draft",
      },
      file_bukti: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "Relative path ke file bukti yang diupload",
      },
      file_bukti_mime: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      catatan_verifikasi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("spj", ["pelaksana_id"], {
      name: "spj_pelaksana_idx",
    });
    await queryInterface.addIndex("spj", ["status"], {
      name: "spj_status_idx",
    });
    await queryInterface.addIndex("spj", ["submitted_at"], {
      name: "spj_submitted_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("spj");
  },
};
