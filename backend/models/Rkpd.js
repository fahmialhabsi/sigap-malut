import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rkpd =
  sequelize.models.Rkpd ||
  sequelize.define(
    "Rkpd",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun: { type: DataTypes.INTEGER, allowNull: false },
      nama_sub_kegiatan: { type: DataTypes.STRING(512), allowNull: false },
      indikator: { type: DataTypes.STRING(512), allowNull: false },
      target: { type: DataTypes.STRING(512), allowNull: true },
      pagu: { type: DataTypes.DECIMAL(20, 2), allowNull: true },
      renja_id: { type: DataTypes.INTEGER, allowNull: true },
      periode_rpjmd_id: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      epelara_rkpd_id: { type: DataTypes.STRING(100), allowNull: true },
      sinkronisasi_status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "belum_sinkron" },
      sinkronisasi_terakhir: { type: DataTypes.DATE, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "rkpd",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["renja_id"], name: "idx_rkpd_renja_id" }],
    },
  );

export default Rkpd;
