import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SuratMasuk =
  sequelize.models.SuratMasuk ||
  sequelize.define(
    "SuratMasuk",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nomor_agenda: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: "Auto-generated: AGD-2026-0001",
      },
      nomor_surat: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Nomor surat dari pengirim",
      },
      tanggal_surat: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      tanggal_terima: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      asal_surat: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      perihal: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isi_ringkas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      jenis_surat: {
        type: DataTypes.ENUM("Biasa", "Penting", "Rahasia", "Sangat Rahasia"),
        defaultValue: "Biasa",
      },
      sifat_surat: {
        type: DataTypes.ENUM("Segera", "Biasa", "Sangat Segera"),
        defaultValue: "Biasa",
      },
      media_terima: {
        type: DataTypes.ENUM("WA", "Email", "Pos", "Kurir", "Langsung", "SIPD"),
        defaultValue: "Langsung",
      },
      file_surat: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      file_lampiran: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ai_status: {
        type: DataTypes.ENUM("pending", "processing", "done", "failed"),
        defaultValue: "pending",
      },
      ai_klasifikasi: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ai_routing: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ai_confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ai_ekstrak_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ditujukan_kepada: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "masuk",
          "disposisi",
          "proses",
          "selesai",
          "arsip",
        ),
        defaultValue: "masuk",
      },
      arsip_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diterima_oleh: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "surat_masuk",
      timestamps: true,
      underscored: true,
    },
  );

export default SuratMasuk;
