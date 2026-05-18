/**
 * Upgrade kolom lampiran_url di tabel spj:
 * - Ubah VARCHAR(500) → TEXT agar bisa menyimpan JSON array multi-dokumen
 * - Format baru: JSON array [{jenis, label, url}] (backward-compatible)
 * - SQLite: tidak perlu ALTER (sudah TEXT by default, skip gracefully)
 */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === "sqlite") {
      // SQLite sudah memperlakukan semua string sebagai TEXT — tidak perlu alter
      console.log("[lampiran-upgrade] SQLite: skip ALTER (TEXT by default)");
      return;
    }
    try {
      await queryInterface.changeColumn("spj", "lampiran_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
      console.log("[lampiran-upgrade] lampiran_url → TEXT OK");
    } catch (err) {
      // Jika kolom belum ada, buat saja (tabel mungkin dibuat via sync)
      if (err.message && err.message.includes("does not exist")) {
        await queryInterface.addColumn("spj", "lampiran_url", {
          type: Sequelize.TEXT,
          allowNull: true,
        });
        console.log("[lampiran-upgrade] lampiran_url column added as TEXT");
      } else {
        throw err;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === "sqlite") return;
    await queryInterface.changeColumn("spj", "lampiran_url", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },
};
