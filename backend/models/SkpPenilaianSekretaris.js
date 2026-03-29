// backend/models/SkpPenilaianSekretaris.js
// Penilaian SKP oleh Sekretaris terhadap bawahan langsungnya (PP 30/2019)

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SkpPenilaianSekretaris = sequelize.define(
  "SkpPenilaianSekretaris",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    periode_bulan: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    periode_tahun: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    penilai_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK users — SEKRETARIS",
    },
    yang_dinilai_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK users — bawahan Sekretaris",
    },
    jabatan_dinilai: {
      type: DataTypes.ENUM(
        "kasubag_umum_kepeg", "jf_perencanaan", "jf_keuangan",
        "jf_lainnya", "bendahara_pengeluaran", "bendahara_gaji",
        "bendahara_barang", "pelaksana_sekretariat"
      ),
      allowNull: false,
    },
    // Komponen SKP (PP 30/2019)
    skor_skp: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    skor_perilaku: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    skor_output: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    skor_disiplin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    catatan_kualitatif: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // KPI tambahan kontekstual
    skor_eksekusi_tugas: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "% tugas selesai tepat waktu",
    },
    skor_kualitas_dokumen: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "% dokumen disetujui tanpa major revision",
    },
    skor_kepatuhan_alur: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "% submit via alur yang benar",
    },
    skor_ketepatan_laporan: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "% laporan on-time",
    },
    skor_total: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    kategori: {
      type: DataTypes.ENUM("sangat_baik", "baik", "cukup", "kurang", "sangat_kurang"),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "final"),
      defaultValue: "draft",
    },
    finalized_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "skp_penilaian_sekretaris",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["periode_bulan", "periode_tahun", "penilai_id", "yang_dinilai_id"],
        name: "unique_periode_sekretaris",
      },
    ],
  }
);

export default SkpPenilaianSekretaris;
