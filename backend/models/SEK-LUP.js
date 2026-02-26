// =====================================================
// MODEL: SekLup
// TABLE: sek_lup
// MODULE: SEK-LUP
// Generated: 2026-02-17T19:24:47.405Z
// =====================================================

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SekLup = sequelize.define(
  "SekLup",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    layanan_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "LY051",
      comment: "FK ke layanan_menpanrb",
    },
    periode: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Bulan periode laporan",
    },
    tahun: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Tahun",
    },
    bulan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Bulan (1-12)",
    },
    umkm_tersertifikasi: {
      type: DataTypes.INTEGER,
      comment: "Jumlah UMKM dapat sertifikat",
    },
    industri_pangan_terdaftar: {
      type: DataTypes.INTEGER,
      comment: "Jumlah industri pangan",
    },
    temuan_pangan_tidak_layak: {
      type: DataTypes.INTEGER,
      comment: "Pangan tidak layak konsumsi",
    },
    tindakan_pengawasan: {
      type: DataTypes.TEXT,
      comment: "Tindakan yang dilakukan",
    },
    kendala_laboratorium: {
      type: DataTypes.TEXT,
      comment: "Kendala operasional lab",
    },
    kebutuhan_reagen: {
      type: DataTypes.TEXT,
      comment: "Kebutuhan bahan kimia",
    },
    kebutuhan_alat: {
      type: DataTypes.TEXT,
      comment: "Kebutuhan peralatan lab",
    },
    analisis: {
      type: DataTypes.TEXT,
      comment: "Analisis kinerja UPTD",
    },
    rekomendasi: {
      type: DataTypes.TEXT,
      comment: "Rekomendasi perbaikan",
    },
    sumber_data: {
      type: DataTypes.STRING(255),
      defaultValue: "UPTD Balai Pengawasan Mutu",
      comment: "Dari UPTD",
    },
    file_laporan: {
      type: DataTypes.STRING(255),
      comment: "Upload laporan PDF",
    },
    file_data_pendukung: {
      type: DataTypes.JSON,
      comment: "Array file pendukung",
    },
    penanggung_jawab: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Sekretaris",
      comment: "PIC",
    },
    pelaksana: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "UPTD",
      comment: "Yang menyusun",
    },
    is_sensitive: {
      type: DataTypes.ENUM("Biasa", "Sensitif"),
      allowNull: false,
      defaultValue: "Sensitif",
      comment: "Data uji lab sensitif",
    },
    status: {
      type: DataTypes.ENUM("draft", "review", "final"),
      allowNull: false,
      defaultValue: "draft",
      comment: "Status",
    },
    keterangan: {
      type: DataTypes.TEXT,
      comment: "Catatan",
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
    tableName: "sek_lup",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SekLup;
