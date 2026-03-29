// backend/models/EwsKetersediaan.js
// Early Warning System — alert ketersediaan & kerawanan pangan Maluku Utara

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EwsKetersediaan = sequelize.define(
  "EwsKetersediaan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tanggal_alert: { type: DataTypes.DATEONLY, allowNull: false },
    jenis_indikator: {
      type: DataTypes.ENUM(
        "stok_beras", "produksi_padi", "wilayah_rawan",
        "harga_pangan", "distribusi", "bencana"
      ),
      allowNull: false,
    },
    nilai_aktual: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    threshold: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    satuan: { type: DataTypes.STRING(30), allowNull: true },
    level_alert: {
      type: DataTypes.ENUM("informasi", "warning", "kritis"),
      allowNull: false,
      defaultValue: "warning",
    },
    deskripsi: { type: DataTypes.TEXT, allowNull: false },
    rekomendasi: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("aktif", "ditangani", "selesai"),
      defaultValue: "aktif",
    },
    dikirim_ke_kadin: { type: DataTypes.BOOLEAN, defaultValue: false },
    dikirim_ke_kadin_at: { type: DataTypes.DATE, allowNull: true },
    dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "ews_ketersediaan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default EwsKetersediaan;
