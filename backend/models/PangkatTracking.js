import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PangkatTracking =
  sequelize.models.PangkatTracking ||
  sequelize.define(
    "PangkatTracking",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      asn_id: { type: DataTypes.INTEGER, allowNull: false },
      unit_kerja: { type: DataTypes.STRING(100), allowNull: false },
      pangkat_saat_ini: { type: DataTypes.STRING(50), allowNull: false },
      golongan_saat_ini: { type: DataTypes.STRING(10), allowNull: false },
      tmt_pangkat_saat_ini: { type: DataTypes.DATEONLY, allowNull: false },
      masa_kerja_golongan: { type: DataTypes.INTEGER, allowNull: true },
      tanggal_eligible: { type: DataTypes.DATEONLY, allowNull: false },
      pangkat_berikutnya: { type: DataTypes.STRING(50), allowNull: true },
      golongan_berikutnya: { type: DataTypes.STRING(10), allowNull: true },
      syarat_diklat_pim: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      syarat_angka_kredit: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      syarat_ijazah: { type: DataTypes.STRING(100), allowNull: true },
      syarat_skp_minimal: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 76 },
      status_proses: {
        type: DataTypes.ENUM(
          "belum_eligible",
          "eligible_belum_diproses",
          "berkas_disiapkan",
          "diajukan_ke_bkd",
          "sk_terbit",
          "selesai",
        ),
        allowNull: false,
        defaultValue: "belum_eligible",
      },
      tanggal_mulai_proses: { type: DataTypes.DATEONLY, allowNull: true },
      tanggal_diajukan_bkd: { type: DataTypes.DATEONLY, allowNull: true },
      nomor_sk: { type: DataTypes.STRING(100), allowNull: true },
      tanggal_sk: { type: DataTypes.DATEONLY, allowNull: true },
      diproses_oleh: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "pangkat_tracking",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default PangkatTracking;

