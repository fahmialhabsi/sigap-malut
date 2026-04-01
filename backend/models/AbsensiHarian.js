import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AbsensiHarian =
  sequelize.models.AbsensiHarian ||
  sequelize.define(
    "AbsensiHarian",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      pegawai_id: { type: DataTypes.INTEGER, allowNull: false },
      tanggal: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.ENUM("hadir", "sakit", "ijin", "cuti", "dinas_luar", "alpha"),
        allowNull: false,
      },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      ref_absen_online: { type: DataTypes.STRING(100), allowNull: true },
      ref_sppd_id: { type: DataTypes.INTEGER, allowNull: true },
      perlu_substitusi: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      verified_by: { type: DataTypes.INTEGER, allowNull: true },
      verified_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "absensi_harian",
      timestamps: false,
      underscored: true,
      createdAt: false,
      updatedAt: false,
    },
  );

export default AbsensiHarian;

