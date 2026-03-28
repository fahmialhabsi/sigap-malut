// backend/models/PerintahLog.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PerintahLog =
  sequelize.models.PerintahLog ||
  sequelize.define(
    "PerintahLog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      perintah_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      aksi: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [["diterima", "update_progres", "ajukan", "setujui", "kembalikan", "tolak", "selesai", "delegasi", "escalate"]],
        },
      },
      oleh_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oleh_role: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      progres_baru: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lampiran_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "perintah_log",
      timestamps: true,
      updatedAt: false,
      underscored: true,
      createdAt: "created_at",
    },
  );

export default PerintahLog;
