"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // program_kegiatan
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("program_kegiatan")) {
      await queryInterface.createTable("program_kegiatan", {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        kode_kegiatan: { type: Sequelize.STRING(30), unique: true, allowNull: true },
        nama_kegiatan: { type: Sequelize.STRING(255), allowNull: false },
        bidang: { type: Sequelize.STRING(50), allowNull: false },
        tahun_anggaran: { type: Sequelize.INTEGER, allowNull: false, defaultValue: new Date().getFullYear() },
        anggaran_pagu: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
        anggaran_realisasi: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
        target_fisik: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
        realisasi_fisik: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
        status: { type: Sequelize.STRING(20), defaultValue: "aktif" },
        catatan: { type: Sequelize.TEXT, allowNull: true },
        dibuat_oleh: { type: Sequelize.INTEGER, allowNull: true },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      });
      await queryInterface.addIndex("program_kegiatan", ["bidang"]);
      await queryInterface.addIndex("program_kegiatan", ["tahun_anggaran"]);
      await queryInterface.addIndex("program_kegiatan", ["status"]);
    }

    // dokumen_perencanaan
    if (!tables.includes("dokumen_perencanaan")) {
      await queryInterface.createTable("dokumen_perencanaan", {
        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
        jenis_dokumen: {
          type: Sequelize.STRING(30), allowNull: false,
          // renstra|renja|rka|dpa|lap_bulanan|lap_triwulan|lkpj|lakip
        },
        judul: { type: Sequelize.STRING(255), allowNull: false },
        periode: { type: Sequelize.STRING(20), allowNull: true },
        status: { type: Sequelize.STRING(20), defaultValue: "draft" },
        dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
        diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
        disetujui_oleh: { type: Sequelize.INTEGER, allowNull: true },
        file_url: { type: Sequelize.STRING(500), allowNull: true },
        catatan: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      });
      await queryInterface.addIndex("dokumen_perencanaan", ["jenis_dokumen"]);
      await queryInterface.addIndex("dokumen_perencanaan", ["status"]);
      await queryInterface.addIndex("dokumen_perencanaan", ["dibuat_oleh"]);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable("dokumen_perencanaan").catch(() => null);
    await queryInterface.dropTable("program_kegiatan").catch(() => null);
  },
};
