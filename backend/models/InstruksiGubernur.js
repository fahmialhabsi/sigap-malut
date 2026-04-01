import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Prompt 1 (Gubernur): instruksi / disposisi strategis ke Kepala Dinas
const InstruksiGubernur = sequelize.define(
  "InstruksiGubernur",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_instruksi: { type: DataTypes.STRING(50), unique: true },
    judul: { type: DataTypes.STRING(255), allowNull: false },
    isi_perintah: { type: DataTypes.TEXT, allowNull: false },
    jenis: {
      type: DataTypes.ENUM(
        "instruksi",
        "disposisi",
        "arahan_strategis",
        "minta_laporan",
        "tanggap_darurat",
      ),
      allowNull: false,
    },
    prioritas: {
      type: DataTypes.ENUM("mendesak", "tinggi", "normal"),
      defaultValue: "normal",
    },
    deadline: { type: DataTypes.DATEONLY },
    lampiran_url: { type: DataTypes.STRING(500) },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    assigned_to: { type: DataTypes.INTEGER, allowNull: false }, // Kepala Dinas
    status: {
      type: DataTypes.ENUM(
        "draf",
        "diterbitkan",
        "dibaca",
        "diproses",
        "selesai",
        "terlambat",
      ),
      defaultValue: "draf",
    },
    dibaca_at: { type: DataTypes.DATE },
    diproses_at: { type: DataTypes.DATE },
    selesai_at: { type: DataTypes.DATE },
    laporan_pelaksanaan: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "instruksi_gubernur",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default InstruksiGubernur;

