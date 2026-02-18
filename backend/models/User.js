// =====================================================
// MODEL: User
// TABLE: users
// =====================================================

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nama_lengkap: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nip: {
      type: DataTypes.STRING(20),
    },
    role: {
      type: DataTypes.ENUM(
        "super_admin",
        "kepala_dinas",
        "sekretaris",
        "kepala_bidang",
        "kepala_uptd",
        "kasubbag",
        "kasubbag_umum",
        "kasubbag_kepegawaian",
        "kasubbag_perencanaan",
        "kasi_uptd",
        "kasubbag_tu_uptd",
        "kasi_mutu_uptd",
        "kasi_teknis_uptd",
        "fungsional",
        "fungsional_perencana",
        "fungsional_analis",
        "pelaksana",
        "guest",
      ),
      allowNull: false,
      defaultValue: "pelaksana",
    },
    unit_kerja: {
      type: DataTypes.ENUM(
        "Sekretariat",
        "UPTD",
        "Bidang Ketersediaan",
        "Bidang Distribusi",
        "Bidang Konsumsi",
      ),
      allowNull: false,
    },
    jabatan: {
      type: DataTypes.STRING(255),
    },
    foto: {
      type: DataTypes.STRING(255),
    },
    telepon: {
      type: DataTypes.STRING(20),
    },
    alamat: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verified_at: {
      type: DataTypes.DATE,
    },
    last_login_at: {
      type: DataTypes.DATE,
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default User;
