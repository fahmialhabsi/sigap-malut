// backend/models/NeracaPangan.js — M035
// Neraca pangan: produksi + impor − ekspor − susut = ketersediaan vs kebutuhan

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NeracaPangan = sequelize.define(
  "NeracaPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // periode: "2026-Q1", "2026-S1", "2026"
    periode: { type: DataTypes.STRING(20), allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
    produksi: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    impor: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    ekspor: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    susut_tercecer: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    // auto-computed: produksi + impor - ekspor - susut_tercecer
    ketersediaan: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    kebutuhan: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    // auto-computed: ketersediaan - kebutuhan (positif = surplus, negatif = defisit)
    surplus_defisit: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    status: { type: DataTypes.ENUM("draft", "final"), defaultValue: "draft" },
    disusun_oleh: { type: DataTypes.INTEGER, allowNull: false },
    disetujui_oleh: { type: DataTypes.INTEGER, allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "neraca_pangan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

// Auto-compute ketersediaan dan surplus_defisit sebelum save
NeracaPangan.addHook("beforeSave", (record) => {
  const ketersediaan =
    Number(record.produksi || 0) +
    Number(record.impor || 0) -
    Number(record.ekspor || 0) -
    Number(record.susut_tercecer || 0);
  record.ketersediaan = ketersediaan;
  if (record.kebutuhan != null) {
    record.surplus_defisit = ketersediaan - Number(record.kebutuhan);
  }
});

export default NeracaPangan;
