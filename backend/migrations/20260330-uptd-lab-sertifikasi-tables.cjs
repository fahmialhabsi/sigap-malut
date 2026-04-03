"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  // Create uji_laboratorium (M074)
  await queryInterface.createTable('uji_laboratorium', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_order: { type: Sequelize.STRING(50), unique: true, allowNull: false },
    tanggal_terima: { type: Sequelize.DATEONLY, allowNull: false },
    asal_permintaan: { type: Sequelize.STRING(50), defaultValue: 'internal_uptd' },
    ref_koordinasi_id: { type: Sequelize.INTEGER, allowNull: true },
    nama_pemohon: { type: Sequelize.STRING(255), allowNull: false },
    jenis_sampel: { type: Sequelize.STRING(255), allowNull: false },
    deskripsi_sampel: { type: Sequelize.TEXT, allowNull: true },
    jumlah_sampel: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    jenis_uji: { type: Sequelize.STRING(100), allowNull: false }, // comma-separated: kimia,mikrobiologi,fisik
    prioritas: { type: Sequelize.STRING(20), defaultValue: 'normal' },
    status: { type: Sequelize.STRING(20), defaultValue: 'menunggu' },
    tanggal_mulai: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_target: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_selesai: { type: Sequelize.DATEONLY, allowNull: true },
    ditugaskan_kasi_id: { type: Sequelize.INTEGER, allowNull: true },
    ditugaskan_jf_id: { type: Sequelize.INTEGER, allowNull: true },
    laporan_url: { type: Sequelize.STRING(500), allowNull: true },
    diterima_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create hasil_uji_kimia (M075)
  await queryInterface.createTable('hasil_uji_kimia', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    uji_lab_id: { type: Sequelize.INTEGER, allowNull: false },
    parameter: { type: Sequelize.STRING(100), allowNull: false },
    nilai_terukur: { type: Sequelize.DECIMAL(12,4), allowNull: true },
    satuan: { type: Sequelize.STRING(30), allowNull: true },
    batas_max_snk: { type: Sequelize.DECIMAL(12,4), allowNull: true },
    status_hasil: { type: Sequelize.STRING(30), defaultValue: 'perlu_verifikasi' },
    metode_uji: { type: Sequelize.STRING(100), allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diuji_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
  });

  // Create hasil_uji_mikrobiologi (M076)
  await queryInterface.createTable('hasil_uji_mikrobiologi', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    uji_lab_id: { type: Sequelize.INTEGER, allowNull: false },
    parameter: { type: Sequelize.STRING(100), allowNull: false },
    nilai_terukur: { type: Sequelize.DECIMAL(15,4), allowNull: true },
    satuan: { type: Sequelize.STRING(30), allowNull: true },
    batas_max_snk: { type: Sequelize.DECIMAL(15,4), allowNull: true },
    status_hasil: { type: Sequelize.STRING(30), defaultValue: 'perlu_verifikasi' },
    metode_uji: { type: Sequelize.STRING(100), allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diuji_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
  });

  // Create hasil_uji_fisik (M077)
  await queryInterface.createTable('hasil_uji_fisik', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    uji_lab_id: { type: Sequelize.INTEGER, allowNull: false },
    parameter: { type: Sequelize.STRING(100), allowNull: false },
    nilai_terukur: { type: Sequelize.DECIMAL(12,4), allowNull: true },
    satuan: { type: Sequelize.STRING(30), allowNull: true },
    batas_snk: { type: Sequelize.STRING(100), allowNull: true },
    status_hasil: { type: Sequelize.STRING(30), defaultValue: 'perlu_verifikasi' },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diuji_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: Sequelize.INTEGER, allowNull: true },
  });

  // Create sertifikasi_pangan (M068-M071)
  await queryInterface.createTable('sertifikasi_pangan', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_sertifikat: { type: Sequelize.STRING(50), unique: true, allowNull: true },
    jenis_sertifikasi: { type: Sequelize.STRING(20), allowNull: false },
    nama_pemohon: { type: Sequelize.STRING(255), allowNull: false },
    jenis_usaha: { type: Sequelize.STRING(255), allowNull: true },
    alamat_usaha: { type: Sequelize.TEXT, allowNull: true },
    produk_pangan: { type: Sequelize.STRING(255), allowNull: true },
    status: { type: Sequelize.STRING(30), defaultValue: 'permohonan_masuk' },
    tanggal_permohonan: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_terbit: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_kadaluwarsa: { type: Sequelize.DATEONLY, allowNull: true },
    ditugaskan_kasi_id: { type: Sequelize.INTEGER, allowNull: true },
    dokumen_permohonan_url: { type: Sequelize.STRING(500), allowNull: true },
    laporan_audit_url: { type: Sequelize.STRING(500), allowNull: true },
    sertifikat_url: { type: Sequelize.STRING(500), allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create audit_pangan (M072)
  await queryInterface.createTable('audit_pangan', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_audit: { type: Sequelize.STRING(50), unique: true, allowNull: true },
    tanggal_audit: { type: Sequelize.DATEONLY, allowNull: false },
    jenis_audit: { type: Sequelize.STRING(30), defaultValue: 'sertifikasi' },
    nama_auditee: { type: Sequelize.STRING(255), allowNull: false },
    alamat: { type: Sequelize.TEXT, allowNull: true },
    jenis_produk: { type: Sequelize.STRING(255), allowNull: true },
    auditor_ketua_id: { type: Sequelize.INTEGER, allowNull: false },
    auditor_anggota: { type: Sequelize.TEXT, allowNull: true }, // JSON string
    temuan: { type: Sequelize.TEXT, allowNull: true },
    rekomendasi: { type: Sequelize.TEXT, allowNull: true },
    status_kepatuhan: { type: Sequelize.STRING(20), allowNull: true },
    laporan_url: { type: Sequelize.STRING(500), allowNull: true },
    tindak_lanjut: { type: Sequelize.TEXT, allowNull: true },
    tanggal_tindak_lanjut: { type: Sequelize.DATEONLY, allowNull: true },
    status: { type: Sequelize.STRING(20), defaultValue: 'direncanakan' },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create registrasi_produk (M073)
  await queryInterface.createTable('registrasi_produk', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_registrasi: { type: Sequelize.STRING(50), unique: true, allowNull: true },
    nama_produk: { type: Sequelize.STRING(255), allowNull: false },
    nama_produsen: { type: Sequelize.STRING(255), allowNull: false },
    jenis_produk: { type: Sequelize.STRING(255), allowNull: true },
    tanggal_permohonan: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_registrasi: { type: Sequelize.DATEONLY, allowNull: true },
    status: { type: Sequelize.STRING(20), defaultValue: 'permohonan' },
    kadaluwarsa: { type: Sequelize.DATEONLY, allowNull: true },
    dokumen_url: { type: Sequelize.STRING(500), allowNull: true },
    ditugaskan_kasi_id: { type: Sequelize.INTEGER, allowNull: true },
    dibuat_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create sampling_pangan (M079)
  await queryInterface.createTable('sampling_pangan', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_sampling: { type: Sequelize.STRING(50), unique: true, allowNull: true },
    tanggal_sampling: { type: Sequelize.DATEONLY, allowNull: false },
    lokasi: { type: Sequelize.STRING(255), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: true },
    jenis_pangan: { type: Sequelize.STRING(255), allowNull: false },
    nama_produsen: { type: Sequelize.STRING(255), allowNull: true },
    metode_sampling: { type: Sequelize.STRING(100), allowNull: true },
    jumlah_sampel: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    kondisi_sampel: { type: Sequelize.TEXT, allowNull: true },
    foto_url: { type: Sequelize.STRING(500), allowNull: true },
    diambil_oleh: { type: Sequelize.INTEGER, allowNull: false },
    diterima_lab_oleh: { type: Sequelize.INTEGER, allowNull: true },
    tanggal_terima_lab: { type: Sequelize.DATEONLY, allowNull: true },
    nomor_order_uji: { type: Sequelize.STRING(50), allowNull: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create pengawasan_berisiko (M078)
  await queryInterface.createTable('pengawasan_berisiko', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    tanggal: { type: Sequelize.DATEONLY, allowNull: false },
    jenis_pangan: { type: Sequelize.STRING(255), allowNull: false },
    lokasi: { type: Sequelize.STRING(255), allowNull: false },
    kabupaten_kota: { type: Sequelize.STRING(100), allowNull: true },
    jenis_risiko: { type: Sequelize.STRING(30), allowNull: true },
    hasil_pengawasan: { type: Sequelize.TEXT, allowNull: true },
    tindak_lanjut: { type: Sequelize.TEXT, allowNull: true },
    status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
    dilakukan_oleh: { type: Sequelize.INTEGER, allowNull: false },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  // Create umkm_tersertifikasi (M080)
  await queryInterface.createTable('umkm_tersertifikasi', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    umkm_pangan_id: { type: Sequelize.INTEGER, allowNull: true },
    nama_umkm: { type: Sequelize.STRING(255), allowNull: false },
    jenis_sertifikasi: { type: Sequelize.STRING(20), allowNull: false },
    nomor_sertifikat: { type: Sequelize.STRING(50), allowNull: true },
    tanggal_terbit: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_kadaluwarsa: { type: Sequelize.DATEONLY, allowNull: true },
    status: { type: Sequelize.STRING(20), defaultValue: 'aktif' },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });

  },

  async down(queryInterface, Sequelize) {
  await queryInterface.dropTable('umkm_tersertifikasi');
  await queryInterface.dropTable('pengawasan_berisiko');
  await queryInterface.dropTable('sampling_pangan');
  await queryInterface.dropTable('registrasi_produk');
  await queryInterface.dropTable('audit_pangan');
  await queryInterface.dropTable('sertifikasi_pangan');
  await queryInterface.dropTable('hasil_uji_fisik');
  await queryInterface.dropTable('hasil_uji_mikrobiologi');
  await queryInterface.dropTable('hasil_uji_kimia');
  await queryInterface.dropTable('uji_laboratorium');

  },
};
