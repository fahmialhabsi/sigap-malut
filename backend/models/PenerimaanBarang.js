import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PenerimaanBarang =
  sequelize.models.PenerimaanBarang ||
  sequelize.define(
    "PenerimaanBarang",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_bast: { type: DataTypes.STRING(50), allowNull: true, unique: true },
      nama_pengadaan: { type: DataTypes.STRING(255), allowNull: false },
      nama_rekanan: { type: DataTypes.STRING(255), allowNull: false },
      nilai_kontrak: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      nomor_kontrak: { type: DataTypes.STRING(100), allowNull: true },
      sub_kegiatan_kode: { type: DataTypes.STRING(50), allowNull: true },
      daftar_barang: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      tanggal_pengiriman: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_bast: { type: DataTypes.DATEONLY, allowNull: true },
      status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "menunggu_kedatangan" },
      catatan_ppk: { type: DataTypes.TEXT, allowNull: true },
      catatan_sekretaris: { type: DataTypes.TEXT, allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "penerimaan_barang",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default PenerimaanBarang;

