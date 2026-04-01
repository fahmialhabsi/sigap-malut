import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DiklatPeserta =
  sequelize.models.DiklatPeserta ||
  sequelize.define(
    "DiklatPeserta",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      diklat_id: { type: DataTypes.INTEGER, allowNull: false },
      asn_id: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "dinominasikan",
          "disetujui",
          "berangkat",
          "selesai",
          "tidak_jadi",
        ),
        allowNull: false,
        defaultValue: "dinominasikan",
      },
      sertifikat_url: { type: DataTypes.STRING(500), allowNull: true },
      catatan: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "diklat_peserta",
      timestamps: false,
      underscored: true,
    },
  );

export default DiklatPeserta;

