import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Prompt 1 (Gubernur): pengajuan dari Kepala Dinas untuk keputusan Gubernur
const PengajuanKeGubernur = sequelize.define(
  "PengajuanKeGubernur",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_pengajuan: { type: DataTypes.STRING(50), unique: true },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    jenis: {
      type: DataTypes.ENUM(
        "persetujuan_kebijakan",
        "persetujuan_anggaran",
        "laporan_strategis",
        "rekomendasi",
        "informasi",
      ),
      allowNull: false,
    },
    isi_pengajuan: { type: DataTypes.TEXT, allowNull: false },
    lampiran_url: { type: DataTypes.STRING(500) },
    submitted_by: { type: DataTypes.INTEGER, allowNull: false }, // Kepala Dinas
    instruksi_id: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM(
        "diajukan",
        "dalam_review",
        "disetujui",
        "ditolak",
        "dikembalikan",
      ),
      defaultValue: "diajukan",
    },
    catatan_gubernur: { type: DataTypes.TEXT },
    diputuskan_at: { type: DataTypes.DATE },
    diputuskan_oleh: { type: DataTypes.INTEGER }, // Gubernur
    revisi_ke: { type: DataTypes.INTEGER, defaultValue: 0 },
    revisi_dari: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "pengajuan_ke_gubernur",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default PengajuanKeGubernur;

