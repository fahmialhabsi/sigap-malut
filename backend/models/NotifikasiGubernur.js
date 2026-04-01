import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Prompt 1 (Gubernur): notifikasi dashboard Gubernur
const NotifikasiGubernur = sequelize.define(
  "NotifikasiGubernur",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false }, // Gubernur
    jenis: {
      type: DataTypes.ENUM(
        "perintah_dibaca",
        "perintah_selesai",
        "pengajuan_masuk",
        "alert_kritis",
        "laporan_tersedia",
        "deadline_dekat",
      ),
      allowNull: false,
    },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    isi: { type: DataTypes.TEXT },
    referensi_id: { type: DataTypes.INTEGER },
    referensi_tabel: { type: DataTypes.STRING(100) },
    sudah_dibaca: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "notifikasi_gubernur",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default NotifikasiGubernur;

