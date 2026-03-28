// backend/models/RekeningAnggaran.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RekeningAnggaran = sequelize.define(
  "RekeningAnggaran",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kode: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    nama: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    jenis: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tahun_anggaran: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: () => new Date().getFullYear(),
    },
    unit_kerja: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    pagu: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    realisasi: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "rekening_anggaran",
    underscored: true,
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default RekeningAnggaran;
