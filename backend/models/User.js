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
      plain_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // IMPORTANT: role_id is UUID FK to roles.id
      role_id: {
        type: DataTypes.UUID,
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

  _User.addHook("beforeValidate", (user) => {
    const data = user.dataValues || {};

    if (!user.name && (user.nama_lengkap || data.nama_lengkap)) {
      user.name = user.nama_lengkap || data.nama_lengkap;
    }
    if (!user.nama_lengkap && (user.name || data.name)) {
      user.nama_lengkap = user.name || data.name;
    }
    if (!user.unit_kerja && (user.unit_id || data.unit_id)) {
      user.unit_kerja = user.unit_id || data.unit_id;
    }

    // IMPORTANT: do NOT auto-fill role_id from `role` string anymore.
    // role_id must always be UUID.

    if (!user.unit_id && (user.unit_kerja || data.unit_kerja || user.unit_id)) {
      user.unit_id = user.unit_kerja || data.unit_kerja || user.unit_id;
    }
  });

  User = _User;

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
