import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ArsipSurat =
  sequelize.models.ArsipSurat ||
  sequelize.define(
    "ArsipSurat",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      kode_klasifikasi: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      nama_klasifikasi: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referensi_type: {
        type: DataTypes.ENUM("surat_masuk", "surat_keluar"),
        allowNull: false,
      },
      referensi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nomor_berkas: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lokasi_fisik: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      file_digital: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      retensi_aktif: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      retensi_inaktif: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      nasib_akhir: {
        type: DataTypes.ENUM("Permanen", "Musnah", "Dinilai Kembali"),
        defaultValue: "Dinilai Kembali",
      },
      tanggal_arsip: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      diarsipkan_oleh: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "arsip_surat",
      timestamps: false,
      createdAt: "created_at",
    },
  );

export default ArsipSurat;
