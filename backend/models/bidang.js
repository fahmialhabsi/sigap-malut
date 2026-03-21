import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Bidang = sequelize.define(
  "Bidang",
  {
    id_bidang: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nama_bidang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bidang",
    timestamps: false,
  },
);

export default Bidang;
