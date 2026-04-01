import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LaporanKerusakanAset =
  sequelize.models.LaporanKerusakanAset ||
  sequelize.define(
    "LaporanKerusakanAset",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      aset_id: { type: DataTypes.INTEGER, allowNull: true },
      nama_aset: { type: DataTypes.STRING(255), allowNull: false },
      lokasi_aset: { type: DataTypes.STRING(255), allowNull: false },
      jenis_kerusakan: { type: DataTypes.STRING(32), allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: false },
      tingkat_urgensi: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "normal" },
      foto_url: { type: DataTypes.STRING(500), allowNull: true },
      dilaporkan_oleh: { type: DataTypes.INTEGER, allowNull: false },
      unit_pelapor: { type: DataTypes.STRING(100), allowNull: true },
      status_tindak_lanjut: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "belum_ditindaklanjuti" },
      catatan_tindak_lanjut: { type: DataTypes.TEXT, allowNull: true },
      ditindaklanjuti_oleh: { type: DataTypes.INTEGER, allowNull: true },
      ditindaklanjuti_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "laporan_kerusakan_aset",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default LaporanKerusakanAset;

