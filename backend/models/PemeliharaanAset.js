import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PemeliharaanAset =
  sequelize.models.PemeliharaanAset ||
  sequelize.define(
    "PemeliharaanAset",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      aset_id: { type: DataTypes.INTEGER, allowNull: false },
      jenis_pemeliharaan: { type: DataTypes.STRING(32), allowNull: false },
      tanggal_jadwal: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_realisasi: { type: DataTypes.DATEONLY, allowNull: true },
      deskripsi: { type: DataTypes.TEXT, allowNull: false },
      vendor_bengkel: { type: DataTypes.STRING(255), allowNull: true },
      biaya_estimasi: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      biaya_realisasi: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "dijadwalkan" },
      spj_id: { type: DataTypes.INTEGER, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "pemeliharaan_aset",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default PemeliharaanAset;

