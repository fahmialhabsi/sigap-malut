// backend/models/TrackingLog.js
// Chain of custody tracking for UPTD lab samples
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TrackingLog =
  sequelize.models.TrackingLog ||
  sequelize.define(
    "TrackingLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_sampel: { type: DataTypes.STRING(100), allowNull: false },
      nama_komoditas: { type: DataTypes.STRING(200), allowNull: true },
      asal_pengiriman: { type: DataTypes.STRING(200), allowNull: true },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "diterima",
      },
      lokasi_sekarang: { type: DataTypes.STRING(200), allowNull: true },
      petugas_id: { type: DataTypes.INTEGER, allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
      timestamp_event: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "TrackingLogs",
      timestamps: false,
      underscored: true,
    },
  );

export default TrackingLog;
