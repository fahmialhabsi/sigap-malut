// Komoditas model for master data (minimal, for hook integration)
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Komoditas = sequelize.define(
  "Komoditas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Nama komoditas",
    },
  },
  {
    tableName: "komoditas",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Komoditas;

// Auto-update workflow: trigger after Komoditas update
import { triggerAfterKomoditasUpdate } from "../services/autoUpdateService.js";
Komoditas.addHook("afterUpdate", triggerAfterKomoditasUpdate);
