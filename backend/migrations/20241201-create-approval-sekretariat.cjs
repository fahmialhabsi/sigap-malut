"use strict";

/** Selaras dengan models/ApprovalSekretariat.js (underscored). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("approval_sekretariat", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nomor_dokumen: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      judul: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      jenis: {
        type: Sequelize.ENUM(
          "kepegawaian_kgb",
          "kepegawaian_pangkat",
          "kepegawaian_cuti",
          "keuangan_spj",
          "keuangan_gu_tup",
          "keuangan_laporan",
          "analisa_jf_perencanaan",
          "analisa_jf_keuangan",
          "aset_bmd",
          "surat_resmi",
          "laporan_konsolidasi",
          "laporan_dari_bidang",
          "tindak_lanjut_kadin",
        ),
        allowNull: false,
      },
      asal_unit: {
        type: Sequelize.ENUM(
          "kasubag_umum_kepeg",
          "jf_perencanaan",
          "jf_keuangan",
          "jf_lainnya",
          "bendahara_pengeluaran",
          "bendahara_gaji",
          "bendahara_barang",
          "pelaksana_sekretariat",
          "bidang_ketersediaan",
          "bidang_distribusi",
          "bidang_konsumsi",
          "uptd",
        ),
        allowNull: false,
      },
      submitted_by: { type: Sequelize.INTEGER, allowNull: false },
      lampiran_url: { type: Sequelize.STRING(500), allowNull: true },
      diverifikasi_kasubag: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      verifikasi_kasubag_at: { type: Sequelize.DATE, allowNull: true },
      verifikasi_oleh_kasubag: { type: Sequelize.INTEGER, allowNull: true },
      catatan_kasubag: { type: Sequelize.TEXT, allowNull: true },
      perlu_analisa_jf: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      dianalisa_jf: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      analisa_jf_at: { type: Sequelize.DATE, allowNull: true },
      analisa_oleh_jf: { type: Sequelize.INTEGER, allowNull: true },
      catatan_jf: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "menunggu_verifikasi_kasubag",
          "dikembalikan_kasubag",
          "menunggu_analisa_jf",
          "dikembalikan_jf",
          "menunggu_persetujuan_sekretaris",
          "disetujui",
          "ditolak",
          "dikembalikan_sekretaris",
          "diteruskan_ke_kadin",
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      catatan_sekretaris: { type: Sequelize.TEXT, allowNull: true },
      diputuskan_at: { type: Sequelize.DATE, allowNull: true },
      diputuskan_oleh: { type: Sequelize.INTEGER, allowNull: true },
      revisi_ke: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      revisi_dari: { type: Sequelize.INTEGER, allowNull: true },
      task_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("approval_sekretariat");
  },
};
