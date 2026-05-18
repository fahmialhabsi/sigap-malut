import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RegulasiVersi =
  sequelize.models.RegulasiVersi ||
  sequelize.define(
    "RegulasiVersi",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nama_regulasi: { type: DataTypes.STRING(255), allowNull: false },
      nomor_regulasi: { type: DataTypes.STRING(128), allowNull: false },
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: "regulasi_versi",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default RegulasiVersi;
