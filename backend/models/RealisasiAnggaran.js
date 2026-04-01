import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RealisasiAnggaran =
  sequelize.models.RealisasiAnggaran ||
  sequelize.define(
    "RealisasiAnggaran",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dpa_id: { type: DataTypes.INTEGER, allowNull: false },
      bulan: { type: DataTypes.INTEGER, allowNull: false }, // 1-12
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      realisasi_bulan_ini: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      kumulatif_realisasi: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      sumber_data: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "spj_otomatis" },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      diinput_oleh: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "realisasi_anggaran",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { unique: true, fields: ["dpa_id", "bulan", "tahun"] },
      ],
    },
  );

export default RealisasiAnggaran;

