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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Soft delete timestamp (for audit log retention policy)",
    },
  },
  {
    tableName: "audit_log",
    timestamps: false,
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

// Prevent modification of immutable fields after create
AuditLog.beforeUpdate((instance, options) => {
  const immutableFields = ["aksi", "modul", "entitas_id", "pegawai_id"];
  for (const field of immutableFields) {
    if (instance.changed(field)) {
      throw new Error("immutable field update not allowed");
    }
  }
});

export default AuditLog;
