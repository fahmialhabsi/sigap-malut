// backend/models/SubKegiatanUsul.js
// Model: usulan sub-kegiatan native yang diinput Kepala Bidang via SIGAP dashboard
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SubKegiatanUsul =
  sequelize.models.SubKegiatanUsul ||
  sequelize.define(
    "SubKegiatanUsul",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      created_by_id: { type: DataTypes.INTEGER, allowNull: true },
      bidang: { type: DataTypes.STRING(100), allowNull: true },
      nama_sub_kegiatan: { type: DataTypes.STRING(300), allowNull: false },
      sasaran: { type: DataTypes.TEXT, allowNull: true },
      indikator: { type: DataTypes.STRING(300), allowNull: true },
      pagu_usulan: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "diajukan",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "SubKegiatanUsul",
      timestamps: false,
      underscored: true,
    },
  );

export default SubKegiatanUsul;
