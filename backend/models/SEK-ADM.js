// =====================================================
// MODEL: SekAdm
// TABLE: sek_adm
// MODULE: SEK-ADM
// Generated: 2026-02-17T19:24:47.366Z
// =====================================================

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SekAdm = sequelize.define(
  "SekAdm",
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
      comment: "Unit yang mengelola surat (BARU - untuk integrasi multi-unit)",
    },
    layanan_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "FK ke layanan_menpanrb (LY001-LY006)",
    },
    nomor_surat: {
      type: DataTypes.STRING(100),
      comment: "Nomor surat/dokumen",
    },
    jenis_naskah: {
      type: DataTypes.ENUM(
        "Surat Masuk",
        "Surat Keluar",
        "SK",
        "SE",
        "ST",
        "SU",
        "ND",
        "MEMO",
        "BA",
        "Nota Dinas",
        "Laporan",
        "Lainnya",
      ),
      comment: "Jenis naskah dinas",
    },
    tanggal_surat: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Tanggal surat dibuat",
    },
    pengirim_penerima: {
      type: DataTypes.STRING(255),
      comment: "Dari atau kepada siapa",
    },
    perihal: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Perihal/subjek surat",
    },
    isi_ringkas: {
      type: DataTypes.TEXT,
      comment: "Ringkasan isi surat",
    },
    disposisi: {
      type: DataTypes.TEXT,
      comment: "Instruksi disposisi pimpinan",
    },
    ditujukan_kepada: {
      type: DataTypes.STRING(255),
      comment: "Unit/bidang tujuan",
    },
    file_surat: {
      type: DataTypes.STRING(255),
      comment: "Upload file PDF/scan",
    },
    file_lampiran: {
      type: DataTypes.JSON,
      comment: "Array path file lampiran",
    },
    arsip_code: {
      type: DataTypes.STRING(50),
      comment: "Kode klasifikasi arsip",
    },
    is_rahasia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Surat rahasia atau tidak",
    },
    penanggung_jawab: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "PIC layanan",
    },
    pelaksana: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Yang melaksanakan",
    },
    is_sensitive: {
      type: DataTypes.ENUM("Biasa", "Sensitif"),
      allowNull: false,
      defaultValue: "Biasa",
      comment: "Klasifikasi data",
    },
    status: {
      type: DataTypes.ENUM("pending", "proses", "selesai", "arsip"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Status proses",
    },
    keterangan: {
      type: DataTypes.TEXT,
      comment: "Catatan tambahan",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "User ID",
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
    tableName: "sek_adm",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SekAdm;
