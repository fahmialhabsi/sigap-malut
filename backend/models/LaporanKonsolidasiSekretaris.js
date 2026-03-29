// backend/models/LaporanKonsolidasiSekretaris.js
// Konsolidasi laporan dari 3 Bidang + UPTD oleh Sekretaris sebelum ke Kepala Dinas

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LaporanKonsolidasiSekretaris = sequelize.define(
  "LaporanKonsolidasiSekretaris",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    periode_bulan: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    periode_tahun: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    jenis_laporan: {
      type: DataTypes.ENUM("bulanan", "triwulan", "semesteran", "tahunan"),
      allowNull: false,
    },
    // Status submit dari masing-masing unit
    ketersediaan_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ketersediaan_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    distribusi_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    distribusi_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    konsumsi_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    konsumsi_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    uptd_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    uptd_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Status konsolidasi Sekretaris
    status: {
      type: DataTypes.ENUM(
        "menunggu_semua_unit",
        "siap_dikonsolidasi",
        "sedang_dikonsolidasi",
        "selesai_konsolidasi",
        "diteruskan_ke_kadin"
      ),
      defaultValue: "menunggu_semua_unit",
    },
    dikerjakan_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "FK users — Sekretaris",
    },
    ringkasan_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "file PDF konsolidasi",
    },
    diteruskan_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "laporan_konsolidasi_sekretaris",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["periode_bulan", "periode_tahun", "jenis_laporan"],
        name: "unique_periode_jenis_laporan",
      },
    ],
  }
);

export default LaporanKonsolidasiSekretaris;
