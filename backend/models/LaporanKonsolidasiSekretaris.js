import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LaporanKonsolidasiSekretaris = sequelize.define(
  "LaporanKonsolidasiSekretaris",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_bulan: { type: DataTypes.SMALLINT, allowNull: false },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    jenis_laporan: {
      type: DataTypes.ENUM("bulanan", "triwulan", "semesteran", "tahunan"),
      allowNull: false,
    },
    ketersediaan_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
    ketersediaan_submitted_at: { type: DataTypes.DATE },
    distribusi_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
    distribusi_submitted_at: { type: DataTypes.DATE },
    konsumsi_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
    konsumsi_submitted_at: { type: DataTypes.DATE },
    uptd_submitted: { type: DataTypes.BOOLEAN, defaultValue: false },
    uptd_submitted_at: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM(
        "menunggu_semua_unit",
        "siap_dikonsolidasi",
        "sedang_dikonsolidasi",
        "selesai_konsolidasi",
        "diteruskan_ke_kadin",
      ),
      defaultValue: "menunggu_semua_unit",
    },
    dikerjakan_oleh: { type: DataTypes.INTEGER, allowNull: true },
    ringkasan_url: { type: DataTypes.STRING(500) },
    diteruskan_at: { type: DataTypes.DATE },
  },
  {
    tableName: "laporan_konsolidasi_sekretaris",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

LaporanKonsolidasiSekretaris.associate = (models) => {
  LaporanKonsolidasiSekretaris.belongsTo(models.User, {
    foreignKey: "dikerjakan_oleh",
    as: "dikerjakanOleh",
  });
};

export default LaporanKonsolidasiSekretaris;
