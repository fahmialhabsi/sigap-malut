import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RoleModulePermission =
  sequelize.models.RoleModulePermission ||
  sequelize.define(
    "RoleModulePermission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_code: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      module_key: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "*",
      },
      permission: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "role_module_permissions",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          name: "idx_rmp_role_module_perm",
          unique: true,
          fields: ["role_code", "module_key", "permission"],
        },
      ],
    },
  );

export default RoleModulePermission;
