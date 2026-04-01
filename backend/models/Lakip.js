import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Lakip =
  sequelize.models.Lakip ||
  sequelize.define(
    "Lakip",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
      submitted_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "lakip",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Lakip;

