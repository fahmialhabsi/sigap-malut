"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable("surat_keluar", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    // Jangan pakai `comment:` di sini — Sequelize menambahkan COMMENT ON COLUMN
    // pada SQL yang sama dengan CREATE TABLE IF NOT EXISTS; jika tabel sudah ada
    // dari sync dengan owner lain → error "must be owner of relation".
    nomor_surat: {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
    },
    draft_nomor: { type: Sequelize.STRING(100), allowNull: true },
    jenis_naskah: {
      type: Sequelize.ENUM(
        "SK",
        "SE",
        "ST",
        "SU",
        "ND",
        "MEMO",
        "BA",
        "LAP",
        "SP",
        "SKET",
        "Lainnya",
      ),
      allowNull: false,
    },
    tanggal_surat: { type: Sequelize.DATEONLY, allowNull: false },
    kepada: { type: Sequelize.TEXT, allowNull: false },
    tembusan: { type: Sequelize.JSON, allowNull: true },
    perihal: { type: Sequelize.TEXT, allowNull: false },
    isi_surat: { type: Sequelize.TEXT, allowNull: true },
    dasar: { type: Sequelize.TEXT, allowNull: true },
    template_id: { type: Sequelize.INTEGER, allowNull: true },
    file_draft: { type: Sequelize.STRING(500), allowNull: true },
    file_final: { type: Sequelize.STRING(500), allowNull: true },
    file_lampiran: { type: Sequelize.JSON, allowNull: true },
    penandatangan: { type: Sequelize.STRING(255), allowNull: true },
    jabatan_ttd: { type: Sequelize.STRING(255), allowNull: true },
    tanggal_ttd: { type: Sequelize.DATEONLY, allowNull: true },
    status: {
      type: Sequelize.ENUM(
        "draft",
        "review",
        "approved",
        "signed",
        "sent",
        "arsip",
        "batal",
      ),
      defaultValue: "draft",
    },
    arsip_code: { type: Sequelize.STRING(50), allowNull: true },
    keterangan: { type: Sequelize.TEXT, allowNull: true },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
    unit_pembuat: { type: Sequelize.STRING(100), allowNull: true },
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

  },

  async down(queryInterface) {
  await queryInterface.dropTable("surat_keluar");

  },
};
