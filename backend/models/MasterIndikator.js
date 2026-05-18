import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MasterIndikator =
  sequelize.models.MasterIndikator ||
  sequelize.define(
    "MasterIndikator",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      regulasi_versi_id: { type: DataTypes.INTEGER, allowNull: false },
      master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: false },
      kode: { type: DataTypes.STRING(64), allowNull: false },
      nama: { type: DataTypes.STRING(512), allowNull: false },
      satuan: { type: DataTypes.STRING(64), allowNull: true },
      dataset_key: { type: DataTypes.STRING(128), allowNull: true },
    },
    {
      tableName: "master_indikator",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default MasterIndikator;
