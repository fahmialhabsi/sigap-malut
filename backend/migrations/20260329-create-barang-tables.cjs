"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    // ── barang_persediaan ────────────────────────────────────────────────────
    if (!tables.includes("barang_persediaan")) {
      await queryInterface.createTable("barang_persediaan", {
        id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        kode:         { type: Sequelize.STRING(50),  allowNull: true },
        nama:         { type: Sequelize.STRING(300), allowNull: false },
        satuan:       { type: Sequelize.STRING(50),  allowNull: true },
        stok:         { type: Sequelize.INTEGER,     allowNull: false, defaultValue: 0 },
        stok_min:     { type: Sequelize.INTEGER,     allowNull: false, defaultValue: 0 },
        nilai_satuan: { type: Sequelize.DECIMAL(15,2), allowNull: true, defaultValue: 0 },
        kondisi:      { type: Sequelize.STRING(50),  allowNull: true, defaultValue: "baik" },
        lokasi:       { type: Sequelize.STRING(200), allowNull: true },
        created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        deleted_at:   { type: Sequelize.DATE, allowNull: true },
      });
    }

    // ── barang_aset ──────────────────────────────────────────────────────────
    if (!tables.includes("barang_aset")) {
      await queryInterface.createTable("barang_aset", {
        id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        kode_barang:  { type: Sequelize.STRING(50),  allowNull: true },
        nama:         { type: Sequelize.STRING(300), allowNull: false },
        satuan:       { type: Sequelize.STRING(50),  allowNull: true, defaultValue: "Unit" },
        jumlah:       { type: Sequelize.INTEGER,     allowNull: false, defaultValue: 1 },
        nilai:        { type: Sequelize.DECIMAL(15,2), allowNull: true, defaultValue: 0 },
        kondisi:      { type: Sequelize.STRING(50),  allowNull: false, defaultValue: "baik",
                        comment: "baik | rusak_ringan | rusak_berat" },
        ruangan:      { type: Sequelize.STRING(200), allowNull: true },
        tgl_perolehan:{ type: Sequelize.DATEONLY,    allowNull: true },
        no_register:  { type: Sequelize.STRING(100), allowNull: true },
        created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        deleted_at:   { type: Sequelize.DATE, allowNull: true },
      });
    }

    // ── barang_pengadaan ─────────────────────────────────────────────────────
    if (!tables.includes("barang_pengadaan")) {
      await queryInterface.createTable("barang_pengadaan", {
        id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        nama:         { type: Sequelize.STRING(300), allowNull: false },
        jenis:        { type: Sequelize.STRING(100), allowNull: true, comment: "ATK | Barang | Jasa | Modal" },
        nilai:        { type: Sequelize.DECIMAL(15,2), allowNull: true, defaultValue: 0 },
        status:       { type: Sequelize.STRING(50),  allowNull: false, defaultValue: "direncanakan",
                        comment: "direncanakan | proses | selesai | dibatalkan" },
        tgl_mulai:    { type: Sequelize.DATEONLY, allowNull: true },
        tgl_selesai:  { type: Sequelize.DATEONLY, allowNull: true },
        vendor:       { type: Sequelize.STRING(200), allowNull: true },
        no_kontrak:   { type: Sequelize.STRING(100), allowNull: true },
        catatan:      { type: Sequelize.TEXT,        allowNull: true },
        created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        deleted_at:   { type: Sequelize.DATE, allowNull: true },
      });
    }

    // ── barang_mutasi ────────────────────────────────────────────────────────
    if (!tables.includes("barang_mutasi")) {
      await queryInterface.createTable("barang_mutasi", {
        id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        tgl:          { type: Sequelize.DATEONLY, allowNull: false },
        nama_barang:  { type: Sequelize.STRING(300), allowNull: false },
        jumlah:       { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        satuan:       { type: Sequelize.STRING(50),  allowNull: true },
        jenis:        { type: Sequelize.STRING(50),  allowNull: false,
                        comment: "masuk | keluar | transfer | penghapusan" },
        tujuan_asal:  { type: Sequelize.STRING(200), allowNull: true },
        keterangan:   { type: Sequelize.TEXT,        allowNull: true },
        dicatat_oleh: { type: Sequelize.INTEGER,     allowNull: true },
        created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        deleted_at:   { type: Sequelize.DATE, allowNull: true },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    for (const t of ["barang_mutasi","barang_pengadaan","barang_aset","barang_persediaan"]) {
      if (tables.includes(t)) await queryInterface.dropTable(t);
    }
  },
};
