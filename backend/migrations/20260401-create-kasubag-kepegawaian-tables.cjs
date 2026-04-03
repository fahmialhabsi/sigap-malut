"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  // NOTE: Target utama SQLite (dev). Hindari fitur MySQL-only seperti "ON UPDATE CURRENT_TIMESTAMP".

  // 1) kgb_tracking
  await queryInterface.createTable("kgb_tracking", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    asn_id: { type: Sequelize.INTEGER, allowNull: false },
    unit_kerja: { type: Sequelize.STRING(100), allowNull: false },
    golongan_saat_ini: { type: Sequelize.STRING(10), allowNull: false },
    tanggal_kgb_terakhir: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_kgb_berikutnya: { type: Sequelize.DATEONLY, allowNull: false },
    besaran_gaji_pokok: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    status_proses: {
      type: Sequelize.ENUM(
        "belum_dimulai",
        "berkas_disiapkan",
        "diajukan_ke_bkd",
        "sk_terbit",
        "selesai",
      ),
      allowNull: false,
      defaultValue: "belum_dimulai",
    },
    tanggal_mulai_proses: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_diajukan_bkd: { type: Sequelize.DATEONLY, allowNull: true },
    nomor_sk: { type: Sequelize.STRING(100), allowNull: true },
    tanggal_sk: { type: Sequelize.DATEONLY, allowNull: true },
    berkas_url: { type: Sequelize.STRING(500), allowNull: true },
    sk_url: { type: Sequelize.STRING(500), allowNull: true },
    notifikasi_h30_terkirim: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notifikasi_h7_terkirim: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notifikasi_h0_terkirim: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notifikasi_terkirim_ke: { type: Sequelize.INTEGER, allowNull: true },
    notifikasi_terkirim_at: { type: Sequelize.DATE, allowNull: true },
    diproses_oleh: { type: Sequelize.INTEGER, allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
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

  // 2) pangkat_tracking
  await queryInterface.createTable("pangkat_tracking", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    asn_id: { type: Sequelize.INTEGER, allowNull: false },
    unit_kerja: { type: Sequelize.STRING(100), allowNull: false },
    pangkat_saat_ini: { type: Sequelize.STRING(50), allowNull: false },
    golongan_saat_ini: { type: Sequelize.STRING(10), allowNull: false },
    tmt_pangkat_saat_ini: { type: Sequelize.DATEONLY, allowNull: false },
    masa_kerja_golongan: { type: Sequelize.INTEGER, allowNull: true },
    tanggal_eligible: { type: Sequelize.DATEONLY, allowNull: false },
    pangkat_berikutnya: { type: Sequelize.STRING(50), allowNull: true },
    golongan_berikutnya: { type: Sequelize.STRING(10), allowNull: true },
    syarat_diklat_pim: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    syarat_angka_kredit: {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    syarat_ijazah: { type: Sequelize.STRING(100), allowNull: true },
    syarat_skp_minimal: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 76,
    },
    status_proses: {
      type: Sequelize.ENUM(
        "belum_eligible",
        "eligible_belum_diproses",
        "berkas_disiapkan",
        "diajukan_ke_bkd",
        "sk_terbit",
        "selesai",
      ),
      allowNull: false,
      defaultValue: "belum_eligible",
    },
    tanggal_mulai_proses: { type: Sequelize.DATEONLY, allowNull: true },
    tanggal_diajukan_bkd: { type: Sequelize.DATEONLY, allowNull: true },
    nomor_sk: { type: Sequelize.STRING(100), allowNull: true },
    tanggal_sk: { type: Sequelize.DATEONLY, allowNull: true },
    diproses_oleh: { type: Sequelize.INTEGER, allowNull: true },
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

  // 3) absensi_harian
  await queryInterface.createTable("absensi_harian", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    pegawai_id: { type: Sequelize.INTEGER, allowNull: false },
    tanggal: { type: Sequelize.DATEONLY, allowNull: false },
    status: {
      type: Sequelize.ENUM("hadir", "sakit", "ijin", "cuti", "dinas_luar", "alpha"),
      allowNull: false,
    },
    keterangan: { type: Sequelize.TEXT, allowNull: true },
    ref_absen_online: { type: Sequelize.STRING(100), allowNull: true },
    ref_sppd_id: { type: Sequelize.INTEGER, allowNull: true },
    perlu_substitusi: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verified_by: { type: Sequelize.INTEGER, allowNull: true },
    verified_at: { type: Sequelize.DATE, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
  await queryInterface.addConstraint("absensi_harian", {
    fields: ["pegawai_id", "tanggal"],
    type: "unique",
    name: "unique_pegawai_tanggal_absensi_harian",
  });

  // 4) cuti
  await queryInterface.createTable("cuti", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    asn_id: { type: Sequelize.INTEGER, allowNull: false },
    jenis_cuti: {
      type: Sequelize.ENUM("tahunan", "sakit", "melahirkan", "alasan_penting", "besar"),
      allowNull: false,
    },
    tanggal_mulai: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_selesai: { type: Sequelize.DATEONLY, allowNull: false },
    jumlah_hari: { type: Sequelize.INTEGER, allowNull: false },
    keperluan: { type: Sequelize.TEXT, allowNull: true },
    lampiran_url: { type: Sequelize.STRING(500), allowNull: true },
    status: {
      type: Sequelize.ENUM("draft", "diajukan", "disetujui", "ditolak", "dibatalkan"),
      allowNull: false,
      defaultValue: "draft",
    },
    diajukan_ke: { type: Sequelize.INTEGER, allowNull: false },
    disetujui_oleh: { type: Sequelize.INTEGER, allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    diputuskan_at: { type: Sequelize.DATE, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // 5) perjalanan_dinas (SPPD)
  await queryInterface.createTable("perjalanan_dinas", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    asn_id: { type: Sequelize.INTEGER, allowNull: false },
    nomor_sppd: { type: Sequelize.STRING(50), allowNull: true, unique: true },
    tujuan: { type: Sequelize.STRING(255), allowNull: false },
    tanggal_berangkat: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_kembali: { type: Sequelize.DATEONLY, allowNull: false },
    jumlah_hari: { type: Sequelize.INTEGER, allowNull: false },
    keperluan: { type: Sequelize.TEXT, allowNull: false },
    jenis_transportasi: { type: Sequelize.STRING(100), allowNull: true },
    estimasi_biaya: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    biaya_riil: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
    status: {
      type: Sequelize.ENUM(
        "draft",
        "diajukan",
        "disetujui",
        "berangkat",
        "selesai",
        "spj_submitted",
        "ditolak",
      ),
      allowNull: false,
      defaultValue: "draft",
    },
    diajukan_ke: { type: Sequelize.INTEGER, allowNull: false },
    disetujui_oleh: { type: Sequelize.INTEGER, allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
    spj_url: { type: Sequelize.STRING(500), allowNull: true },
    spj_submitted_at: { type: Sequelize.DATE, allowNull: true },
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

  // 6) diklat
  await queryInterface.createTable("diklat", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    nama_diklat: { type: Sequelize.STRING(255), allowNull: false },
    jenis: {
      type: Sequelize.ENUM("struktural", "teknis", "fungsional", "pim"),
      allowNull: false,
    },
    penyelenggara: { type: Sequelize.STRING(255), allowNull: true },
    tanggal_mulai: { type: Sequelize.DATEONLY, allowNull: false },
    tanggal_selesai: { type: Sequelize.DATEONLY, allowNull: false },
    lokasi: { type: Sequelize.STRING(255), allowNull: true },
    kuota: { type: Sequelize.INTEGER, allowNull: true },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // 7) diklat_peserta
  await queryInterface.createTable("diklat_peserta", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    diklat_id: { type: Sequelize.INTEGER, allowNull: false },
    asn_id: { type: Sequelize.INTEGER, allowNull: false },
    status: {
      type: Sequelize.ENUM(
        "dinominasikan",
        "disetujui",
        "berangkat",
        "selesai",
        "tidak_jadi",
      ),
      allowNull: false,
      defaultValue: "dinominasikan",
    },
    sertifikat_url: { type: Sequelize.STRING(500), allowNull: true },
    catatan: { type: Sequelize.TEXT, allowNull: true },
  });

  // 8) skp_penilaian_kasubag
  await queryInterface.createTable("skp_penilaian_kasubag", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    periode_bulan: { type: Sequelize.INTEGER, allowNull: false },
    periode_tahun: { type: Sequelize.INTEGER, allowNull: false },
    penilai_id: { type: Sequelize.INTEGER, allowNull: false },
    yang_dinilai_id: { type: Sequelize.INTEGER, allowNull: false },
    skor_skp: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_perilaku: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_output: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_disiplin: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    catatan_kualitatif: { type: Sequelize.TEXT, allowNull: true },
    skor_eksekusi_tugas: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_kualitas_input: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_kepatuhan_alur: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_absensi: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    skor_total: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
    kategori: {
      type: Sequelize.ENUM(
        "sangat_baik",
        "baik",
        "cukup",
        "kurang",
        "sangat_kurang",
      ),
      allowNull: true,
    },
    status: { type: Sequelize.ENUM("draft", "final"), allowNull: false, defaultValue: "draft" },
    finalized_at: { type: Sequelize.DATE, allowNull: true },
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
  await queryInterface.addConstraint("skp_penilaian_kasubag", {
    fields: ["periode_bulan", "periode_tahun", "penilai_id", "yang_dinilai_id"],
    type: "unique",
    name: "unique_periode_kasubag_penilai_dinilai",
  });

  // 9) notifikasi_kasubag
  await queryInterface.createTable("notifikasi_kasubag", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: Sequelize.INTEGER, allowNull: false },
    jenis: {
      type: Sequelize.ENUM(
        "task_dari_sekretaris",
        "pelaksana_submit",
        "pelaksana_submit_ulang",
        "keputusan_sekretaris",
        "kgb_jatuh_tempo_kritis",
        "kgb_jatuh_tempo_peringatan",
        "pangkat_eligible",
        "absensi_perlu_substitusi",
        "skp_deadline",
        "diklat_tersedia",
      ),
      allowNull: false,
    },
    judul: { type: Sequelize.STRING(255), allowNull: false },
    isi: { type: Sequelize.TEXT, allowNull: true },
    referensi_id: { type: Sequelize.INTEGER, allowNull: true },
    referensi_tabel: { type: Sequelize.STRING(100), allowNull: true },
    sudah_dibaca: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  },

  async down(queryInterface) {
  // Drop in reverse order to reduce FK issues (FKs not strictly enforced in SQLite by default).
  await queryInterface.dropTable("notifikasi_kasubag");
  await queryInterface.dropTable("skp_penilaian_kasubag");
  await queryInterface.dropTable("diklat_peserta");
  await queryInterface.dropTable("diklat");
  await queryInterface.dropTable("perjalanan_dinas");
  await queryInterface.dropTable("cuti");
  await queryInterface.dropTable("absensi_harian");
  await queryInterface.dropTable("pangkat_tracking");
  await queryInterface.dropTable("kgb_tracking");

  },
};
