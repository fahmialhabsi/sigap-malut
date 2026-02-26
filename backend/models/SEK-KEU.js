// =====================================================
// MODEL: SekKeu
// TABLE: sek_keu
// MODULE: SEK-KEU
// Generated: 2026-02-17T19:24:47.391Z
// =====================================================

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SekKeu = sequelize.define(
  "SekKeu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unit_kerja: {
      type: DataTypes.ENUM(
        "Sekretariat",
        "UPTD",
        "Bidang Ketersediaan",
        "Bidang Distribusi",
        "Bidang Konsumsi",
      ),
      allowNull: false,
      defaultValue: "Sekretariat",
      comment: "Unit pengelola anggaran (BARU - untuk integrasi multi-unit)",
    },
    kode_unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "00",
      comment:
        "Kode unit untuk RKA/DPA (BARU - 00=Sekretariat 01=UPTD 02=Bid.Ketersediaan dll)",
    },
    layanan_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "FK ke layanan_menpanrb (LY016-LY022)",
    },
    tahun_anggaran: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Tahun anggaran",
    },
    jenis_layanan_keuangan: {
      type: DataTypes.ENUM(
        "RKA/DPA",
        "Belanja",
        "Pencairan",
        "SPJ",
        "Laporan",
        "Revisi",
        "Monitoring",
      ),
      allowNull: false,
      comment: "Jenis layanan keuangan",
    },
    nomor_dpa: {
      type: DataTypes.STRING(100),
      comment: "Nomor DPA",
    },
    kode_rekening: {
      type: DataTypes.STRING(50),
      comment: "Kode rekening belanja",
    },
    nama_rekening: {
      type: DataTypes.STRING(255),
      comment: "Nama rekening",
    },
    pagu_anggaran: {
      type: DataTypes.DECIMAL(15, 2),
      comment: "Total pagu",
    },
    realisasi: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      comment: "Realisasi pengeluaran",
    },
    sisa_anggaran: {
      type: DataTypes.DECIMAL(15, 2),
      comment: "Pagu - Realisasi",
    },
    persentase_realisasi: {
      type: DataTypes.DECIMAL(5, 2),
      comment: "Auto-calculate",
    },
    jenis_belanja: {
      type: DataTypes.ENUM(
        "Belanja Pegawai",
        "Belanja Barang",
        "Belanja Modal",
      ),
      comment: "Jenis belanja",
    },
    uraian_belanja: {
      type: DataTypes.TEXT,
      comment: "Detail belanja",
    },
    keperluan: {
      type: DataTypes.TEXT,
      comment: "Untuk apa",
    },
    penerima_uang: {
      type: DataTypes.STRING(255),
      comment: "Nama penerima",
    },
    tanggal_pencairan: {
      type: DataTypes.DATEONLY,
      comment: "Tanggal dana cair",
    },
    jumlah_pencairan: {
      type: DataTypes.DECIMAL(15, 2),
      comment: "Nominal pencairan",
    },
    nomor_spj: {
      type: DataTypes.STRING(100),
      comment: "Nomor SPJ",
    },
    tanggal_spj: {
      type: DataTypes.DATEONLY,
      comment: "Tanggal SPJ",
    },
    status_spj: {
      type: DataTypes.ENUM(
        "Belum SPJ",
        "SPJ Lengkap",
        "SPJ Kurang",
        "Diverifikasi",
        "Ditolak",
      ),
      comment: "Status SPJ",
    },
    jenis_revisi: {
      type: DataTypes.ENUM("Revisi Anggaran", "Pergeseran", "Tambahan"),
      comment: "Jenis revisi",
    },
    alasan_revisi: {
      type: DataTypes.TEXT,
      comment: "Alasan revisi anggaran",
    },
    file_dpa: {
      type: DataTypes.STRING(255),
      comment: "Upload DPA PDF",
    },
    file_spj: {
      type: DataTypes.STRING(255),
      comment: "Upload bukti SPJ",
    },
    file_bukti: {
      type: DataTypes.JSON,
      comment: "Array file bukti (kwitansi dll)",
    },
    file_laporan: {
      type: DataTypes.STRING(255),
      comment: "Laporan keuangan PDF",
    },
    penanggung_jawab: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Bendahara",
      comment: "PIC",
    },
    pelaksana: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Yang melaksanakan",
    },
    is_sensitive: {
      type: DataTypes.ENUM("Biasa", "Sensitif"),
      allowNull: false,
      defaultValue: "Sensitif",
      comment: "Data keuangan sensitif",
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "proses",
        "diverifikasi",
        "disetujui",
        "ditolak",
        "selesai",
      ),
      allowNull: false,
      defaultValue: "pending",
      comment: "Status",
    },
    keterangan: {
      type: DataTypes.TEXT,
      comment: "Catatan",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "User ID",
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sek_keu",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SekKeu;
