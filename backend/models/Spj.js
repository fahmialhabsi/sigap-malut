// backend/models/Spj.js
// Model untuk Surat Pertanggungjawaban (SPJ) — SIGAP MALUT
// Create: hanya pelaksana/staf_pelaksana
// Verify/Reject: hanya bendahara

import { DataTypes } from "sequelize";

export default function SpjModel(sequelize) {
  const Spj = sequelize.define(
    "Spj",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nomor_spj: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      judul: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      kegiatan: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      pelaksana_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unit_kerja: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      tanggal_kegiatan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_anggaran: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "submitted", "verified", "rejected"),
        allowNull: false,
        defaultValue: "draft",
      },
      file_bukti: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Path ke file bukti yang diupload",
      },
      file_bukti_mime: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      catatan_verifikasi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "spj",
      underscored: true,
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

  Spj.associate = (models) => {
    if (models.User) {
      Spj.belongsTo(models.User, { foreignKey: "pelaksana_id", as: "pelaksana" });
      Spj.belongsTo(models.User, { foreignKey: "verified_by", as: "verifikator" });
    }
  };

  return Spj;
}
