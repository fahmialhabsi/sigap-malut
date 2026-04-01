import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Renstra =
  sequelize.models.Renstra ||
  sequelize.define(
    "Renstra",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      periode_awal: { type: DataTypes.INTEGER, allowNull: false },
      periode_akhir: { type: DataTypes.INTEGER, allowNull: false },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      epelara_renstra_id: { type: DataTypes.STRING(100), allowNull: true },
      sinkronisasi_terakhir: { type: DataTypes.DATE, allowNull: true },
      sinkronisasi_status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "belum_sinkron" },
      dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "renstra",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Renstra;

