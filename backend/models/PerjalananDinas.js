import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PerjalananDinas =
  sequelize.models.PerjalananDinas ||
  sequelize.define(
    "PerjalananDinas",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      asn_id: { type: DataTypes.INTEGER, allowNull: false },
      nomor_sppd: { type: DataTypes.STRING(50), allowNull: true },
      tujuan: { type: DataTypes.STRING(255), allowNull: false },
      tanggal_berangkat: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_kembali: { type: DataTypes.DATEONLY, allowNull: false },
      jumlah_hari: { type: DataTypes.INTEGER, allowNull: false },
      keperluan: { type: DataTypes.TEXT, allowNull: false },
      jenis_transportasi: { type: DataTypes.STRING(100), allowNull: true },
      estimasi_biaya: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      biaya_riil: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "diajukan",
          "disetujui",
          "berangkat",
          "selesai",
          "spj_submitted",
          "ditolak",
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      diajukan_ke: { type: DataTypes.INTEGER, allowNull: false },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      spj_url: { type: DataTypes.STRING(500), allowNull: true },
      spj_submitted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "perjalanan_dinas",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default PerjalananDinas;

