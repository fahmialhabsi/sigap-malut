// backend/models/GajiPegawai.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const GajiPegawai = sequelize.define(
  "GajiPegawai",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nama: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    jabatan: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    bulan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tahun: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gaji_pokok: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tunjangan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    potongan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
      validate: { isIn: [["pending", "dibayar", "ditahan"]] },
    },
  },
  {
    tableName: "gaji_pegawai",
    underscored: true,
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default GajiPegawai;
