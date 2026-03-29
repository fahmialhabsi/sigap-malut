// backend/models/NotifikasiSekretaris.js
// Notifikasi spesifik untuk Sekretaris: perintah KaDin, bypass, KGB alert, dll.

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NotifikasiSekretaris = sequelize.define(
  "NotifikasiSekretaris",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK users — SEKRETARIS",
    },
    jenis: {
      type: DataTypes.ENUM(
        "perintah_kadin_baru", "perintah_kadin_selesai",
        "approval_masuk_kasubag", "approval_masuk_jf",
        "approval_masuk_bendahara", "approval_masuk_bidang_uptd",
        "bypass_terdeteksi", "kgb_jatuh_tempo",
        "laporan_bidang_terlambat", "keputusan_kadin",
        "sppg_belum_input", "skp_deadline"
      ),
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referensi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referensi_tabel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sudah_dibaca: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prioritas: {
      type: DataTypes.ENUM("rendah", "normal", "tinggi", "mendesak"),
      defaultValue: "normal",
    },
  },
  {
    tableName: "notifikasi_sekretaris",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default NotifikasiSekretaris;
