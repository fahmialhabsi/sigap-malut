import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SkpPenilaianKasubag =
  sequelize.models.SkpPenilaianKasubag ||
  sequelize.define(
    "SkpPenilaianKasubag",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      periode_bulan: { type: DataTypes.INTEGER, allowNull: false },
      periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
      penilai_id: { type: DataTypes.INTEGER, allowNull: false },
      yang_dinilai_id: { type: DataTypes.INTEGER, allowNull: false },
      skor_skp: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_perilaku: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_output: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_disiplin: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      catatan_kualitatif: { type: DataTypes.TEXT, allowNull: true },
      skor_eksekusi_tugas: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_kualitas_input: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_kepatuhan_alur: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_absensi: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      skor_total: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      kategori: {
        type: DataTypes.ENUM(
          "sangat_baik",
          "baik",
          "cukup",
          "kurang",
          "sangat_kurang",
        ),
        allowNull: true,
      },
      status: { type: DataTypes.ENUM("draft", "final"), allowNull: false, defaultValue: "draft" },
      finalized_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "skp_penilaian_kasubag",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default SkpPenilaianKasubag;

