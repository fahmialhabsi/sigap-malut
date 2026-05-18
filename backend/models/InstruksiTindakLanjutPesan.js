import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Pesan tindak lanjut antara Gubernur / Kepala Dinas / Sekretaris
 * atas instruksi yang sedang berjalan.
 * Relasi: instruksi_id → instruksi_gubernur.id
 */
const InstruksiTindakLanjutPesan =
  sequelize.models.InstruksiTindakLanjutPesan ||
  sequelize.define(
    "InstruksiTindakLanjutPesan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      instruksi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pengirim_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      penerima_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pesan: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      jenis: {
        type: DataTypes.ENUM("tindak_lanjut", "konfirmasi", "klarifikasi", "laporan"),
        defaultValue: "tindak_lanjut",
      },
      lampiran_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "instruksi_tindak_lanjut_pesan",
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  );

export default InstruksiTindakLanjutPesan;
