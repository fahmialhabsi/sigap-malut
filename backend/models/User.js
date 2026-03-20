import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_uuid: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nip: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pelaksana",
    },
    role_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    unit_kerja: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
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
      allowNull: true,
    },
    // Keep `last_login` attribute for controller compatibility, map it to DB column `last_login_at`.
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    plain_password: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    dashboardUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "dashboardUrl",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeValidate: (user) => {
        if (!user.nama_lengkap && user.name) {
          user.nama_lengkap = user.name;
        }
        if (!user.name && user.nama_lengkap) {
          user.name = user.nama_lengkap;
        }

        if (!user.unit_kerja && user.unit_id) {
          user.unit_kerja = user.unit_id;
        }
        if (!user.unit_id && user.unit_kerja) {
          user.unit_id = user.unit_kerja;
        }
      },
    },
  },
);

export default User;
