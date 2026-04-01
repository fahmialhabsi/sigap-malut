import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Spj =
  sequelize.models.Spj ||
  sequelize.define(
    "Spj",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nomor_spj: { type: DataTypes.STRING(50), allowNull: true, unique: true },
      jenis_belanja: { type: DataTypes.STRING(32), allowNull: false },
      sub_kegiatan_kode: { type: DataTypes.STRING(50), allowNull: false },
      kode_rekening: { type: DataTypes.STRING(50), allowNull: false },
      nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      keterangan: { type: DataTypes.TEXT, allowNull: true },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      tanggal_kegiatan: { type: DataTypes.DATEONLY, allowNull: false },
      lampiran_url: { type: DataTypes.STRING(500), allowNull: true },
      status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "draft" },
      diverifikasi_bendahara_oleh: { type: DataTypes.INTEGER, allowNull: true },
      diverifikasi_bendahara_at: { type: DataTypes.DATE, allowNull: true },
      catatan_bendahara: { type: DataTypes.TEXT, allowNull: true },
      diverifikasi_ppk_oleh: { type: DataTypes.INTEGER, allowNull: true },
      diverifikasi_ppk_at: { type: DataTypes.DATE, allowNull: true },
      catatan_ppk: { type: DataTypes.TEXT, allowNull: true },
      dasar_hukum_tolak: { type: DataTypes.TEXT, allowNull: true },
      disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      dibayarkan_oleh: { type: DataTypes.INTEGER, allowNull: true },
      dibayarkan_at: { type: DataTypes.DATE, allowNull: true },
      nomor_rekening_penerima: { type: DataTypes.STRING(50), allowNull: true },
      bank_penerima: { type: DataTypes.STRING(100), allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      jenis_bendahara: { type: DataTypes.STRING(16), allowNull: true }, // pengeluaran|gaji|barang
      bendahara_pengirim_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "spj",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default Spj;

