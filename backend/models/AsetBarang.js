import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AsetBarang =
  sequelize.models.AsetBarang ||
  sequelize.define(
    "AsetBarang",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_register: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      kode_barang: { type: DataTypes.STRING(50), allowNull: true },
      nama_barang: { type: DataTypes.STRING(255), allowNull: false },
      spesifikasi: { type: DataTypes.TEXT, allowNull: true },
      jenis_aset: { type: DataTypes.STRING(32), allowNull: false },
      kategori_belanja: { type: DataTypes.STRING(16), allowNull: false },
      tahun_perolehan: { type: DataTypes.INTEGER, allowNull: false },
      nilai_perolehan: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      nilai_buku: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      unit_kerja: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "Sekretariat" },
      lokasi_fisik: { type: DataTypes.STRING(255), allowNull: true },
      pemegang_id: { type: DataTypes.INTEGER, allowNull: true },
      kondisi: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "baik" },
      status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "aktif" },
      foto_url: { type: DataTypes.STRING(500), allowNull: true },
      dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "aset_barang",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default AsetBarang;

