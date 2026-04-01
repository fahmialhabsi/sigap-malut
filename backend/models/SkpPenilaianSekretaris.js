import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SkpPenilaianSekretaris = sequelize.define(
  "SkpPenilaianSekretaris",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_bulan: { type: DataTypes.SMALLINT, allowNull: false },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    penilai_id: { type: DataTypes.INTEGER, allowNull: false },
    yang_dinilai_id: { type: DataTypes.INTEGER, allowNull: false },
    jabatan_dinilai: {
      type: DataTypes.ENUM(
        "kasubag_umum_kepeg",
        "jf_perencanaan",
        "jf_keuangan",
        "jf_lainnya",
        "bendahara_pengeluaran",
        "bendahara_gaji",
        "bendahara_barang",
        "pelaksana_sekretariat",
      ),
      allowNull: false,
    },
    skor_skp: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_perilaku: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_output: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_disiplin: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    catatan_kualitatif: { type: DataTypes.TEXT, allowNull: true },
    skor_eksekusi_tugas: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_kualitas_dokumen: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_kepatuhan_alur: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_ketepatan_laporan: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    skor_total: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    kategori: {
      type: DataTypes.ENUM("sangat_baik", "baik", "cukup", "kurang", "sangat_kurang"),
      allowNull: true,
    },
    status: { type: DataTypes.ENUM("draft", "final"), defaultValue: "draft" },
    finalized_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "skp_penilaian_sekretaris",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

SkpPenilaianSekretaris.associate = (models) => {
  SkpPenilaianSekretaris.belongsTo(models.User, {
    as: "penilai",
    foreignKey: "penilai_id",
  });
  SkpPenilaianSekretaris.belongsTo(models.User, {
    as: "yangDinilai",
    foreignKey: "yang_dinilai_id",
  });
};

export default SkpPenilaianSekretaris;
