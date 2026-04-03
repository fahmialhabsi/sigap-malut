import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/** Arsip baris audit Manajemen User setelah retensi (baris dipindah dari audit_log). */
const AuditLogArchive = sequelize.define(
  "AuditLogArchive",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    original_audit_log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modul: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entitas_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    aksi: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    data_lama: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    data_baru: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    pegawai_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    /** Waktu created_at pada baris asli di audit_log */
    source_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "audit_log_archive",
    timestamps: false,
  },
);

export default AuditLogArchive;
