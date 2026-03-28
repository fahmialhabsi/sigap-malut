// backend/models/Perintah.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Perintah =
  sequelize.models.Perintah ||
  sequelize.define(
    "Perintah",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nomor_perintah: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      judul: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isi: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dari_role: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dari_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ke_role: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ke_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prioritas: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "normal",
        validate: { isIn: [["kritis", "tinggi", "normal", "rendah"]] },
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "terkirim",
      },
      progres_persen: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      lampiran_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      is_rahasia: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      modul_terkait: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      perintah_induk_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "perintah",
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  );

// Auto-generate nomor_perintah before create
Perintah.addHook("beforeCreate", async (record) => {
  if (!record.nomor_perintah) {
    const year = new Date().getFullYear();
    const prefix = record.dari_role === "gubernur" ? "GUB" : record.dari_role.toUpperCase().slice(0, 5);
    const count = await Perintah.count({ where: { dari_role: record.dari_role } });
    record.nomor_perintah = `P/${prefix}/${year}/${String(count + 1).padStart(3, "0")}`;
  }
});

export default Perintah;
