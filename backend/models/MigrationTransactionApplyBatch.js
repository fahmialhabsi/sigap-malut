import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MigrationTransactionApplyBatch =
  sequelize.models.MigrationTransactionApplyBatch ||
  sequelize.define(
    "MigrationTransactionApplyBatch",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      regulasi_versi_from_id: { type: DataTypes.INTEGER, allowNull: false },
      regulasi_versi_to_id: { type: DataTypes.INTEGER, allowNull: false },
      applied_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.STRING(24), allowNull: false, defaultValue: "applied" },
      row_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      note: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "migration_transaction_apply_batch",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default MigrationTransactionApplyBatch;
