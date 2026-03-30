import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Snapshot hasil kalkulasi indeks & inflasi harian (proxy operasional).
 * Inflasi resmi bulanan tetap mengacu publikasi BPS; baris ini mendokumentasikan
 * metode internal (Laspeyres-tipe + bobot konfigurasi).
 */
const InflasiHarian = sequelize.define(
  "InflasiHarian",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    /** Indeks Laspeyres-tipe, skala 100 = titik acuan bulan berjalan */
    indeks_laspeyres: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
    },
    /** (I_t / I_{t-1} - 1) * 100 */
    inflasi_dod_persen: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    /** Perkiraan MTD vs rata-rata 7 hari pertama bulan yang sama */
    inflasi_mtd_persen: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    /** (I_t / I_{t-365} - 1)*100 jika data tersedia, else null */
    inflasi_yoy_proksi_persen: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    jumlah_baris_agregasi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jumlah_komoditas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    /** Persen komoditas acuan (bpsPanganBobot) yang punya p_t dan p_0 saat perhitungan */
    coverage_komoditas_persen: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    metodologi_ringkas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detail_perhitungan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "inflasi_harian",
    timestamps: true,
    underscored: true,
  },
);

export default InflasiHarian;
