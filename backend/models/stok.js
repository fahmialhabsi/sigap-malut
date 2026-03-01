import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

let Stok;
if (sequelize.models && sequelize.models.stok) {
  Stok = sequelize.models.stok;
} else {
  Stok = sequelize.define(
    "stok",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      layanan_id: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB },
    },
    { tableName: "stok" },
  );
}

export default Stok;
