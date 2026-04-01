import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NotifikasiKasubag =
  sequelize.models.NotifikasiKasubag ||
  sequelize.define(
    "NotifikasiKasubag",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      jenis: {
        type: DataTypes.ENUM(
          "task_dari_sekretaris",
          "pelaksana_submit",
          "pelaksana_submit_ulang",
          "keputusan_sekretaris",
          "kgb_jatuh_tempo_kritis",
          "kgb_jatuh_tempo_peringatan",
          "pangkat_eligible",
          "absensi_perlu_substitusi",
          "skp_deadline",
          "diklat_tersedia",
        ),
        allowNull: false,
      },
      judul: { type: DataTypes.STRING(255), allowNull: false },
      isi: { type: DataTypes.TEXT, allowNull: true },
      referensi_id: { type: DataTypes.INTEGER, allowNull: true },
      referensi_tabel: { type: DataTypes.STRING(100), allowNull: true },
      sudah_dibaca: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: "notifikasi_kasubag",
      timestamps: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default NotifikasiKasubag;

