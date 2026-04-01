import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const NotifikasiSekretaris = sequelize.define(
  "NotifikasiSekretaris",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    jenis: {
      type: DataTypes.ENUM(
        "perintah_kadin_baru",
        "perintah_kadin_selesai",
        "approval_masuk_kasubag",
        "approval_masuk_jf",
        "approval_masuk_bendahara",
        "approval_masuk_bidang_uptd",
        "bypass_terdeteksi",
        "kgb_jatuh_tempo",
        "laporan_bidang_terlambat",
        "keputusan_kadin",
        "sppg_belum_input",
        "skp_deadline",
      ),
      allowNull: false,
    },

    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    isi: {
      type: DataTypes.TEXT,
    },

    referensi_id: {
      type: DataTypes.INTEGER,
    },

    referensi_tabel: {
      type: DataTypes.STRING(100),
    },

    sudah_dibaca: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "notifikasi_sekretaris",
    timestamps: true,
    underscored: true, // biar konsisten snake_case
  },
);

// ======================
// ASSOCIATION
// ======================
NotifikasiSekretaris.associate = (models) => {
  NotifikasiSekretaris.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

export default NotifikasiSekretaris;
