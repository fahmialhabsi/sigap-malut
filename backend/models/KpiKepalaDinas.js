import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Prompt 1 (Gubernur): snapshot KPI bulanan Kepala Dinas (0-100)
const KpiKepalaDinas = sequelize.define(
  "KpiKepalaDinas",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_bulan: { type: DataTypes.SMALLINT, allowNull: false }, // 1-12
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false }, // Kepala Dinas
    skor_eksekusi_perintah: { type: DataTypes.DECIMAL(5, 2) },
    skor_response_time: { type: DataTypes.DECIMAL(5, 2) },
    skor_capaian_program: { type: DataTypes.DECIMAL(5, 2) },
    skor_realisasi_anggaran: { type: DataTypes.DECIMAL(5, 2) },
    skor_kepatuhan_laporan: { type: DataTypes.DECIMAL(5, 2) },
    skor_kinerja_asn: { type: DataTypes.DECIMAL(5, 2) },
    skor_ketahanan_pangan: { type: DataTypes.DECIMAL(5, 2) },
    skor_sla_layanan: { type: DataTypes.DECIMAL(5, 2) },
    skor_total: { type: DataTypes.DECIMAL(5, 2) },
    kategori: {
      type: DataTypes.ENUM("sangat_baik", "baik", "cukup", "kurang", "sangat_kurang"),
    },
    catatan_gubernur: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "kpi_kepala_dinas",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["periode_bulan", "periode_tahun", "user_id"] }],
  },
);

export default KpiKepalaDinas;

