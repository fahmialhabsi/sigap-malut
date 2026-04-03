"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  // M056: konsumsi_pangan (basis PPH)
  await queryInterface.createTable("konsumsi_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    kelompok_pangan: { type: Sequelize.STRING(30), allowNull: false },
    konsumsi_gram_per_kapita: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    sumber_data: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "bps_susenas" },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" }, // draft|terverifikasi
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
  await queryInterface.addIndex("konsumsi_pangan", [
    "periode_tahun",
    "kabupaten_kota",
    "kelompok_pangan",
  ]);

  // M057: pph (hasil kalkulasi)
  await queryInterface.createTable("pph", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    skor_pph: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
    skor_energi: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
    skor_protein: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
    analisa: { type: Sequelize.TEXT, allowNull: true },
    rekomendasi: { type: Sequelize.TEXT, allowNull: true },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
    disetujui_oleh: { type: Sequelize.INTEGER, allowNull: true },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" }, // draft|final
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
  await queryInterface.addIndex("pph", ["periode_tahun", "kabupaten_kota"]);

  // M058: sppg_penerima
  await queryInterface.createTable("sppg_penerima", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    kecamatan: { type: Sequelize.STRING(100), allowNull: true },
    nama_satuan: { type: Sequelize.STRING(255), allowNull: false },
    jenis_satuan: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "sekolah" },
    jumlah_penerima: { type: Sequelize.INTEGER, allowNull: false },
    koordinat_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    koordinat_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    status_aktif: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    tanggal_daftar: { type: Sequelize.DATEONLY, allowNull: false },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
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
  await queryInterface.addIndex("sppg_penerima", ["kabupaten_kota"]);

  // M059: sppg_distribusi
  await queryInterface.createTable("sppg_distribusi", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    periode_bulan: { type: Sequelize.TINYINT, allowNull: false },
    periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
    sppg_penerima_id: { type: Sequelize.INTEGER, allowNull: false },
    jumlah_penerima_terealisasi: { type: Sequelize.INTEGER, allowNull: true },
    komoditas_distribusi: { type: Sequelize.TEXT, allowNull: true }, // JSON string
    tanggal_distribusi: { type: Sequelize.DATEONLY, allowNull: true },
    status_distribusi: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "belum" },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
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
  await queryInterface.addIndex("sppg_distribusi", [
    "periode_tahun",
    "periode_bulan",
    "sppg_penerima_id",
  ]);

  // M063: inspeksi_keamanan
  await queryInterface.createTable("inspeksi_keamanan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_inspeksi: { type: Sequelize.STRING(50), allowNull: true },
    tanggal_inspeksi: { type: Sequelize.DATEONLY, allowNull: false },
    lokasi: { type: Sequelize.STRING(255), allowNull: false },
    jenis_lokasi: { type: Sequelize.STRING(30), allowNull: true },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    jenis_pangan: { type: Sequelize.STRING(255), allowNull: true },
    metode_inspeksi: { type: Sequelize.STRING(20), allowNull: false },
    temuan: { type: Sequelize.TEXT, allowNull: true },
    status_temuan: { type: Sequelize.STRING(20), allowNull: false },
    rekomendasi: { type: Sequelize.TEXT, allowNull: true },
    tindak_lanjut: { type: Sequelize.TEXT, allowNull: true },
    foto_url: { type: Sequelize.STRING(500), allowNull: true },
    laporan_url: { type: Sequelize.STRING(500), allowNull: true },
    perlu_uji_lab: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    nomor_permintaan_uji: { type: Sequelize.STRING(50), allowNull: true },
    hasil_uji_uptd: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "draft" },
    dilakukan_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
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
  await queryInterface.addIndex("inspeksi_keamanan", ["tanggal_inspeksi", "kabupaten_kota"]);

  // M064: keracunan_pangan
  await queryInterface.createTable("keracunan_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_kasus: { type: Sequelize.STRING(50), allowNull: true },
    tanggal_kejadian: { type: Sequelize.DATE, allowNull: false },
    lokasi: { type: Sequelize.STRING(255), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    jumlah_korban: { type: Sequelize.INTEGER, allowNull: false },
    jumlah_rawat: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    dugaan_penyebab: { type: Sequelize.TEXT, allowNull: true },
    sumber_laporan: { type: Sequelize.STRING(30), allowNull: false },
    status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "baru" },
    sampel_diambil: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    tanggal_ambil_sampel: { type: Sequelize.DATEONLY, allowNull: true },
    hasil_uji_lab: { type: Sequelize.TEXT, allowNull: true },
    intervensi: { type: Sequelize.TEXT, allowNull: true },
    koordinasi_bpom: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    laporan_url: { type: Sequelize.STRING(500), allowNull: true },
    ditangani_oleh: { type: Sequelize.INTEGER, allowNull: false },
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
  await queryInterface.addIndex("keracunan_pangan", ["tanggal_kejadian", "kabupaten_kota"]);

  // M066: umkm_pangan
  await queryInterface.createTable("umkm_pangan", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nama_umkm: { type: Sequelize.STRING(255), allowNull: false },
    pemilik: { type: Sequelize.STRING(255), allowNull: false },
    jenis_produk: { type: Sequelize.STRING(255), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: false },
    alamat: { type: Sequelize.TEXT, allowNull: true },
    no_telp: { type: Sequelize.STRING(20), allowNull: true },
    status_sertifikasi: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "belum" },
    jenis_sertifikasi: { type: Sequelize.STRING(100), allowNull: true },
    tanggal_sertifikasi: { type: Sequelize.DATEONLY, allowNull: true },
    masa_berlaku_sertifikasi: { type: Sequelize.DATEONLY, allowNull: true },
    status_binaan: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "aktif" },
    diinput_oleh: { type: Sequelize.INTEGER, allowNull: false },
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
  await queryInterface.addIndex("umkm_pangan", ["kabupaten_kota"]);

  // Koordinasi lintas unit: koordinasi_uptd
  await queryInterface.createTable("koordinasi_uptd", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_surat: { type: Sequelize.STRING(50), allowNull: true },
    tanggal_permintaan: { type: Sequelize.DATEONLY, allowNull: false },
    dari_bidang: { type: Sequelize.STRING(30), allowNull: false }, // Bidang Konsumsi/Bidang Distribusi
    jenis_permintaan: { type: Sequelize.STRING(40), allowNull: false },
    deskripsi: { type: Sequelize.TEXT, allowNull: false },
    jenis_sampel: { type: Sequelize.STRING(255), allowNull: true },
    jumlah_sampel: { type: Sequelize.INTEGER, allowNull: true },
    tanggal_pengiriman: { type: Sequelize.DATEONLY, allowNull: true },
    status: { type: Sequelize.STRING(30), allowNull: false, defaultValue: "dikirim" },
    hasil_ringkasan: { type: Sequelize.TEXT, allowNull: true },
    laporan_uptd_url: { type: Sequelize.STRING(500), allowNull: true },
    tanggal_hasil: { type: Sequelize.DATEONLY, allowNull: true },
    ref_kasus_id: { type: Sequelize.INTEGER, allowNull: true },
    ref_inspeksi_id: { type: Sequelize.INTEGER, allowNull: true },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
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
  await queryInterface.addIndex("koordinasi_uptd", ["tanggal_permintaan", "dari_bidang"]);

  },

  async down(queryInterface) {
  await queryInterface.dropTable("koordinasi_uptd");
  await queryInterface.dropTable("umkm_pangan");
  await queryInterface.dropTable("keracunan_pangan");
  await queryInterface.dropTable("inspeksi_keamanan");
  await queryInterface.dropTable("sppg_distribusi");
  await queryInterface.dropTable("sppg_penerima");
  await queryInterface.dropTable("pph");
  await queryInterface.dropTable("konsumsi_pangan");

  },
};
