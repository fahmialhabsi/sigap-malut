import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modul: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama modul yang diubah",
    },
    entitas_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID entitas yang diubah",
    },
    aksi: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Jenis aksi (CREATE/UPDATE/DELETE)",
    },
    data_lama: {
      type: DataTypes.JSON,
      comment: "Snapshot data sebelum perubahan",
    },
    data_baru: {
      type: DataTypes.JSON,
      comment: "Snapshot data setelah perubahan",
    },
    pegawai_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID pegawai pelaku",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "audit_log",
    timestamps: false,
  },
);

export default AuditLog;
