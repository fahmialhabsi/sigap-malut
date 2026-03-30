import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const HargaPangan = sequelize.define(
  "HargaPangan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Kelompok satu kali submit dari pelaksana",
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pasar_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pasar_nama: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kabupaten_kota: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    komoditas_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    komoditas_key: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "Kunci dari form (mis. beras_medium)",
    },
    komoditas_nama: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Denormalisasi jika komoditas_id null",
    },
    harga_eceran: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    satuan: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "kg",
    },
    sumber_data: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "survei_langsung",
    },
    diinput_oleh: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    diverifikasi_oleh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "draft",
      comment: "draft | menunggu_verifikasi | terverifikasi | dikembalikan",
    },
    catatan_verifikasi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    /** True jika di luar rentang konfigurasi atau lonjakan harian > ambang — tetap disimpan, wajib verifikasi manual */
    is_anomaly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    /** JSON string: { reasons: [...] } dari lapisan validasi bisnis */
    anomaly_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "harga_pangan",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["batch_id"] },
      { fields: ["tanggal", "status"] },
      { fields: ["diinput_oleh", "tanggal"] },
      { fields: ["komoditas_id", "tanggal"] },
    ],
  },
);

export default HargaPangan;
