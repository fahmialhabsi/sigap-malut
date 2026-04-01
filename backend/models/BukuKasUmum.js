import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BukuKasUmum =
  sequelize.models.BukuKasUmum ||
  sequelize.define(
    "BukuKasUmum",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tanggal: { type: DataTypes.DATEONLY, allowNull: false },
      uraian: { type: DataTypes.STRING(255), allowNull: false },
      nomor_bukti: { type: DataTypes.STRING(100), allowNull: true },
      jenis_transaksi: { type: DataTypes.STRING(8), allowNull: false }, // debet|kredit
      nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      saldo_setelah: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      referensi_tabel: { type: DataTypes.STRING(32), allowNull: true },
      referensi_id: { type: DataTypes.INTEGER, allowNull: true },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      input_otomatis: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "buku_kas_umum",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default BukuKasUmum;

