import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Layanan = sequelize.define(
  "Layanan",
  {
    id_layanan: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    kode_layanan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_layanan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bidang_penanggung_jawab: {
      type: DataTypes.STRING,
      allowNull: false,
      // FK ke bidang (opsional, bisa ditambah association jika tabel bidang sudah ada)
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    jenis_output: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SLA: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    aktif: {
      type: DataTypes.BOOLEAN,
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
    tableName: "layanan",
    timestamps: false,
  },
);

export default Layanan;
