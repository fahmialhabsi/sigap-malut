"use strict";

/**
 * Migration: create skp_penilaian table
 * Purpose: Track SKP (Sasaran Kinerja Pegawai) assessments for Kasubag, Kasi UPTD, and JF roles.
 * State machine: draft → submitted → reviewed → approved → signed
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("skp_penilaian", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      pegawai_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      penilai_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "ID penilai (atasan langsung)",
      },
      periode_tahun: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      periode_semester: {
        type: Sequelize.ENUM("1", "2"),
        allowNull: false,
        defaultValue: "1",
      },
      unit_kerja: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      jabatan: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("draft", "submitted", "reviewed", "approved", "signed"),
        allowNull: false,
        defaultValue: "draft",
      },
      nilai_kuantitatif: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: "Nilai 0–100",
      },
      nilai_kualitatif: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Sangat Baik / Baik / Cukup / Kurang",
      },
      catatan_penilai: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      catatan_pegawai: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      signed_at: {
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

    await queryInterface.addIndex("skp_penilaian", ["pegawai_id", "periode_tahun", "periode_semester"], {
      unique: true,
      name: "skp_penilaian_pegawai_periode_unique",
    });
    await queryInterface.addIndex("skp_penilaian", ["penilai_id"], {
      name: "skp_penilaian_penilai_idx",
    });
    await queryInterface.addIndex("skp_penilaian", ["status"], {
      name: "skp_penilaian_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("skp_penilaian");
  },
};
