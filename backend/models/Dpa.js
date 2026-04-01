import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Dpa =
  sequelize.models.Dpa ||
  sequelize.define(
    "Dpa",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tahun_anggaran: { type: DataTypes.INTEGER, allowNull: false },
      kode_sub_kegiatan: { type: DataTypes.STRING(50), allowNull: false },
      nama_sub_kegiatan: { type: DataTypes.STRING(255), allowNull: false },
      kode_rekening: { type: DataTypes.STRING(50), allowNull: false },
      uraian_belanja: { type: DataTypes.STRING(255), allowNull: false },
      jenis_belanja: { type: DataTypes.STRING(16), allowNull: false }, // pegawai|barang_jasa|modal
      pagu_anggaran: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      realisasi: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      epelara_dpa_id: { type: DataTypes.STRING(100), allowNull: true },
      sinkronisasi_terakhir: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "dpa",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["tahun_anggaran", "kode_rekening"],
        },
      ],
    },
  );

export default Dpa;

