import { DataTypes, Op } from "sequelize";
import sequelize from "../config/database.js";

const MappingSubKegiatan =
  sequelize.models.MappingSubKegiatan ||
  sequelize.define(
    "MappingSubKegiatan",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      regulasi_versi_from_id: { type: DataTypes.INTEGER, allowNull: false },
      regulasi_versi_to_id: { type: DataTypes.INTEGER, allowNull: false },
      old_master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: false },
      new_master_sub_kegiatan_id: { type: DataTypes.INTEGER, allowNull: true },
      old_kode: { type: DataTypes.STRING(64), allowNull: true },
      new_kode: { type: DataTypes.STRING(64), allowNull: true },
      old_nama: { type: DataTypes.STRING(512), allowNull: true },
      new_nama: { type: DataTypes.STRING(512), allowNull: true },
      confidence_score: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
      mapping_type: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "auto" },
      status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "pending" },
      match_reason: { type: DataTypes.STRING(64), allowNull: true },
    },
    {
      tableName: "mapping_sub_kegiatan",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

MappingSubKegiatan.addHook("beforeSave", async (instance) => {
  if (instance.getDataValue("status") !== "approved") return;
  const fromId = instance.getDataValue("regulasi_versi_from_id");
  const toId = instance.getDataValue("regulasi_versi_to_id");
  const oldId = instance.getDataValue("old_master_sub_kegiatan_id");
  const selfId = instance.getDataValue("id");

  const dup = await MappingSubKegiatan.findOne({
    where: {
      regulasi_versi_from_id: fromId,
      regulasi_versi_to_id: toId,
      old_master_sub_kegiatan_id: oldId,
      status: "approved",
      ...(selfId ? { id: { [Op.ne]: selfId } } : {}),
    },
  });

  if (dup) {
    const err = new Error(
      "Sudah ada mapping approved lain untuk kombinasi versi asal, versi tujuan, dan sub kegiatan lama yang sama.",
    );
    err.name = "SequelizeValidationError";
    err.code = "DUPLICATE_APPROVED_MAPPING";
    throw err;
  }
});

export default MappingSubKegiatan;
