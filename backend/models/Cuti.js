import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Cuti =
  sequelize.models.Cuti ||
  sequelize.define(
    "Cuti",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      asn_id: { type: DataTypes.INTEGER, allowNull: false },
      jenis_cuti: {
        type: DataTypes.ENUM("tahunan", "sakit", "melahirkan", "alasan_penting", "besar"),
        allowNull: false,
      },
      tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: false },
      jumlah_hari: { type: DataTypes.INTEGER, allowNull: false },
      keperluan: { type: DataTypes.TEXT, allowNull: true },
      lampiran_url: { type: DataTypes.STRING(500), allowNull: true },
      status: {
        type: DataTypes.ENUM("draft", "diajukan", "disetujui", "ditolak", "dibatalkan"),
        allowNull: false,
        defaultValue: "draft",
      },
      diajukan_ke: { type: DataTypes.INTEGER, allowNull: false },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      diputuskan_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "cuti",
      timestamps: false,
      underscored: true,
      createdAt: false,
      updatedAt: false,
    },
  );

export default Cuti;

