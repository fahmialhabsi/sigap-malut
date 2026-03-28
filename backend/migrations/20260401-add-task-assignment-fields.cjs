"use strict";

/**
 * Migration: add assignment + command-link fields to Tasks table
 * Per spesifikasi-dashboard-gubernur.md section 4
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("Tasks");

    const addIfMissing = async (column, definition) => {
      if (!tableDesc[column]) {
        await queryInterface.addColumn("Tasks", column, definition);
      }
    };

    await addIfMissing("assignee_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await addIfMissing("jenis_tugas", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "satu_kali",
      comment: "satu_kali | rutin | insidental",
    });

    await addIfMissing("jadwal_rutin", {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: "Cron expression untuk tugas rutin",
    });

    await addIfMissing("adalah_substitusi", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addIfMissing("alasan_substitusi", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addIfMissing("kinerja_ke_user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "User yang mendapat kredit kinerja dari tugas ini",
    });

    await addIfMissing("unit_kerja", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await addIfMissing("catatan_penolakan", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addIfMissing("perintah_id", {
      type: Sequelize.UUID,
      allowNull: true,
      comment: "Link ke tabel perintah jika task ini berasal dari perintah",
    });
  },

  async down(queryInterface) {
    const cols = [
      "assignee_id", "jenis_tugas", "jadwal_rutin", "adalah_substitusi",
      "alasan_substitusi", "kinerja_ke_user_id", "unit_kerja",
      "catatan_penolakan", "perintah_id",
    ];
    for (const col of cols) {
      try {
        await queryInterface.removeColumn("Tasks", col);
      } catch (_) {
        // ignore if already removed
      }
    }
  },
};
