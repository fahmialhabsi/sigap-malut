import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Audit trail perubahan harga_pangan (create batch, verify, return, admin amend).
 * old_value / new_value: snapshot JSON untuk kepatuhan audit pemerintahan.
 */
const HargaPanganLog = sequelize.define(
  "HargaPanganLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    harga_pangan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Baris tunggal jika relevan (UPDATE); null untuk aksi batch",
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    aksi: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "CREATE | UPDATE | VERIFY | RETURN",
    },
    old_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actor_role: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
  },
  {
    tableName: "harga_pangan_logs",
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { fields: ["batch_id"] },
      { fields: ["harga_pangan_id"] },
      { fields: ["aksi"] },
      { fields: ["created_at"] },
    ],
  },
);

export default HargaPanganLog;
