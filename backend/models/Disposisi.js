import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Disposisi =
  sequelize.models.Disposisi ||
  sequelize.define(
    "Disposisi",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      surat_masuk_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "surat_masuk",
          key: "id",
        },
      },
      dari_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kepada_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      kepada_unit: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      instruksi: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      batas_waktu: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      prioritas: {
        type: DataTypes.ENUM("Rendah", "Normal", "Tinggi", "Urgent"),
        defaultValue: "Normal",
      },
      status: {
        type: DataTypes.ENUM("belum_dibaca", "dibaca", "proses", "selesai"),
        defaultValue: "belum_dibaca",
      },
      tanggal_disposisi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      tanggal_selesai: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      hasil_tindak_lanjut: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_balasan: {
        type: DataTypes.JSON,
        allowNull: true,
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
      tableName: "disposisi",
      timestamps: true,
      underscored: true,
    },
  );

export default Disposisi;
