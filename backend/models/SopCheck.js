// backend/models/SopCheck.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SopCheck =
  sequelize.models.SopCheck ||
  sequelize.define(
    "SopCheck",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      checklist_item: { type: DataTypes.STRING(300), allowNull: false },
      kategori: { type: DataTypes.STRING(100), allowNull: true },
      is_compliant: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      checked_by_id: { type: DataTypes.INTEGER, allowNull: true },
      checked_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "SopChecks",
      timestamps: false,
      underscored: true,
    },
  );

export default SopCheck;
