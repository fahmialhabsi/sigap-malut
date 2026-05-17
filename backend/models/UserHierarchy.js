import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Kolom aktual di DB (dibuat oleh seed-asn-83.mjs):
//   user_id       = bawahan / subordinate
//   supervisor_id = atasan / supervisor
//   has_subordinate = apakah node ini punya bawahan lagi (boolean)
const UserHierarchy =
  sequelize.models.UserHierarchy ||
  sequelize.define(
    "UserHierarchy",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:        { type: DataTypes.INTEGER, allowNull: false },
      supervisor_id:  { type: DataTypes.INTEGER, allowNull: false },
      has_subordinate:{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      unit_kerja:     { type: DataTypes.STRING,  allowNull: true },
    },
    {
      tableName: "user_hierarchy",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default UserHierarchy;

