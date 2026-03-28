"use strict";

/**
 * Migration: create perintah + perintah_log tables
 * Perintah = command/instruction flowing through chain of command
 * (Gubernur→KaDin→Sekretaris/Kabid/Kepala UPTD→Pelaksana)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("perintah", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nomor_perintah: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: "Auto-generated: P/GUB/2026/001 or P/KADIN/2026/001",
      },
      judul: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      isi: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      dari_role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "gubernur | kepala_dinas | sekretaris | kepala_bidang | dll",
      },
      dari_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      ke_role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "kepala_dinas | sekretaris | kepala_bidang | kepala_uptd | pelaksana",
      },
      ke_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "NULL = broadcast ke semua user dengan role ke_role",
      },
      prioritas: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "normal",
        comment: "kritis | tinggi | normal | rendah",
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "terkirim",
        comment: "terkirim|diterima|dalam_proses|diajukan|disetujui|dikembalikan|ditolak|selesai|escalated",
      },
      progres_persen: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lampiran_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_rahasia: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      modul_terkait: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: "SEK-ADM | SEK-KEU | dll — opsional link ke modul",
      },
      perintah_induk_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "Delegasi dari perintah lebih atas",
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

    await queryInterface.addIndex("perintah", ["dari_user_id"], { name: "perintah_dari_user_idx" });
    await queryInterface.addIndex("perintah", ["ke_user_id"], { name: "perintah_ke_user_idx" });
    await queryInterface.addIndex("perintah", ["ke_role"], { name: "perintah_ke_role_idx" });
    await queryInterface.addIndex("perintah", ["status"], { name: "perintah_status_idx" });
    await queryInterface.addIndex("perintah", ["deadline"], { name: "perintah_deadline_idx" });

    await queryInterface.createTable("perintah_log", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      perintah_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "perintah", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      aksi: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment: "diterima|update_progres|ajukan|setujui|kembalikan|tolak|selesai|delegasi|escalate",
      },
      oleh_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      oleh_role: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      catatan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      progres_baru: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      lampiran_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("perintah_log", ["perintah_id"], { name: "perintah_log_perintah_idx" });
    await queryInterface.addIndex("perintah_log", ["oleh_user_id"], { name: "perintah_log_user_idx" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("perintah_log");
    await queryInterface.dropTable("perintah");
  },
};
