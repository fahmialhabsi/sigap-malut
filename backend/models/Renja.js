import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Renja =
  sequelize.models.Renja ||
  sequelize.define(
    "Renja",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      renstra_id: { type: DataTypes.INTEGER, allowNull: true },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      ketersediaan_submitted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      distribusi_submitted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      konsumsi_submitted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      uptd_submitted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      epelara_renja_id: { type: DataTypes.STRING(100), allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "renja",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Renja;

