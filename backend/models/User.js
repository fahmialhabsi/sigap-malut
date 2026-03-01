// File: backend/models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

let User;
if (sequelize.models && sequelize.models.User) {
  User = sequelize.models.User;
} else {
  const _User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit_kerja: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      jabatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  // Map legacy input fields to current column names before validation
  _User.addHook("beforeValidate", (user) => {
    const data = user.dataValues || {};
    if (!user.name && (user.nama_lengkap || data.nama_lengkap))
      user.name = user.nama_lengkap || data.nama_lengkap;
    // Ensure legacy column `nama_lengkap` is set when tests or callers provide `name`
    if (!user.nama_lengkap && (user.name || data.name))
      user.nama_lengkap = user.name || data.name;
    // Ensure `unit_kerja` (legacy string) is populated when callers supply `unit_id` as string
    if (!user.unit_kerja && (user.unit_id || data.unit_id))
      user.unit_kerja = user.unit_id || data.unit_id;
    if (!user.role_id && (user.role || data.role || user.role_id)) {
      user.role_id = user.role || data.role || user.role_id;
    }
    if (!user.unit_id && (user.unit_kerja || data.unit_kerja || user.unit_id)) {
      user.unit_id = user.unit_kerja || data.unit_kerja || user.unit_id;
    }
  });

  User = _User;

  // Instance helper for tests and legacy code: perform a soft delete (paranoid)
  if (!User.prototype.softDelete) {
    User.prototype.softDelete = async function () {
      await User.update(
        { deleted_at: new Date() },
        { where: { id: this.id }, paranoid: false },
      );
      const found = await User.findByPk(this.id, { paranoid: false });
      return found || this;
    };
  }
}

export default User;

// Ensure instance helper exists even when model was already registered
if (User && !User.prototype.softDelete) {
  User.prototype.softDelete = async function () {
    await User.update(
      { deleted_at: new Date() },
      { where: { id: this.id }, paranoid: false },
    );
    const found = await User.findByPk(this.id, { paranoid: false });
    return found || this;
  };
}
