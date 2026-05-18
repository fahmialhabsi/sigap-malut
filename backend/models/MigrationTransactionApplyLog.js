import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MigrationTransactionApplyLog =
  sequelize.models.MigrationTransactionApplyLog ||
  sequelize.define(
    "MigrationTransactionApplyLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      batch_id: { type: DataTypes.INTEGER, allowNull: false },
      table_name: { type: DataTypes.STRING(64), allowNull: false },
      row_pk: { type: DataTypes.INTEGER, allowNull: false },
      mapping_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      old_master_program_id: { type: DataTypes.INTEGER, allowNull: true },
      old_master_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      old_master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      new_master_program_id: { type: DataTypes.INTEGER, allowNull: true },
      new_master_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      new_master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      rolled_back_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "migration_transaction_apply_log",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );

export default MigrationTransactionApplyLog;
