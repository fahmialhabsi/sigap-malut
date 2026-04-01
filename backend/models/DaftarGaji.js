import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DaftarGaji =
  sequelize.models.DaftarGaji ||
  sequelize.define(
    "DaftarGaji",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      periode_bulan: { type: DataTypes.INTEGER, allowNull: false },
      periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
      nomor_daftar_gaji: { type: DataTypes.STRING(50), allowNull: true, unique: true },
      jumlah_asn: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_gaji_kotor: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      total_potongan: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      total_gaji_bersih: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      pagu_dpa_belanja_pegawai: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      sisa_pagu: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "draft" },
      catatan_jf_keuangan: { type: DataTypes.TEXT, allowNull: true },
      dianalisa_oleh: { type: DataTypes.INTEGER, allowNull: true },
      dianalisa_at: { type: DataTypes.DATE, allowNull: true },
      catatan_sekretaris: { type: DataTypes.TEXT, allowNull: true },
      disetujui_sekretaris_oleh: { type: DataTypes.INTEGER, allowNull: true },
      disetujui_at: { type: DataTypes.DATE, allowNull: true },
      revisi_ke: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "daftar_gaji",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default DaftarGaji;

