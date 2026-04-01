import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UangPersediaan =
  sequelize.models.UangPersediaan ||
  sequelize.define(
    "UangPersediaan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun_anggaran: { type: DataTypes.INTEGER, allowNull: false },
      jenis: { type: DataTypes.STRING(16), allowNull: false }, // up_awal|gu|tup|sisa_more
      nominal_diajukan: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      nominal_disetujui: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      tanggal_pengajuan: { type: DataTypes.DATEONLY, allowNull: false },
      tanggal_cair_bpkad: { type: DataTypes.DATEONLY, allowNull: true },
      nominal_cair: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "draft" },
      catatan_sekretaris: { type: DataTypes.TEXT, allowNull: true },
      diajukan_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "uang_persediaan",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default UangPersediaan;

