import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AgendaSurat =
  sequelize.models.AgendaSurat ||
  sequelize.define(
    "AgendaSurat",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nomor_agenda: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      jenis: {
        type: DataTypes.ENUM("masuk", "keluar"),
        allowNull: false,
      },
      referensi_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      perihal: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dari_kepada: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      kode_klasifikasi: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      tahun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bulan: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "agenda_surat",
      timestamps: false,
      createdAt: "created_at",
    },
  );

export default AgendaSurat;
