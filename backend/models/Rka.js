import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rka =
  sequelize.models.Rka ||
  sequelize.define(
    "Rka",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun_anggaran: { type: DataTypes.INTEGER, allowNull: false },
      kode_sub_kegiatan: { type: DataTypes.STRING(50), allowNull: false },
      nama_sub_kegiatan: { type: DataTypes.STRING(255), allowNull: false },
      kode_rekening: { type: DataTypes.STRING(50), allowNull: false },
      uraian_belanja: { type: DataTypes.STRING(255), allowNull: false },
      jenis_belanja: { type: DataTypes.STRING(16), allowNull: false }, // pegawai|barang_jasa|modal
      pagu_diusulkan: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      epelara_rka_id: { type: DataTypes.STRING(100), allowNull: true },
      master_program_id: { type: DataTypes.INTEGER, allowNull: true },
      master_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "rka",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Rka;

