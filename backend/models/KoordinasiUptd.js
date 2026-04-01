// Koordinasi lintas unit: permintaan uji ke UPTD dan hasilnya
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KoordinasiUptd = sequelize.define(
  "KoordinasiUptd",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_surat: { type: DataTypes.STRING(50) },
    tanggal_permintaan: { type: DataTypes.DATEONLY, allowNull: false },
    dari_bidang: { type: DataTypes.STRING(30), allowNull: false },
    jenis_permintaan: { type: DataTypes.STRING(40), allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: false },
    jenis_sampel: { type: DataTypes.STRING(255) },
    jumlah_sampel: { type: DataTypes.INTEGER },
    tanggal_pengiriman: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "dikirim" },
    hasil_ringkasan: { type: DataTypes.TEXT },
    laporan_uptd_url: { type: DataTypes.STRING(500) },
    tanggal_hasil: { type: DataTypes.DATEONLY },
    ref_kasus_id: { type: DataTypes.INTEGER },
    ref_inspeksi_id: { type: DataTypes.INTEGER },
    dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "koordinasi_uptd",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default KoordinasiUptd;

