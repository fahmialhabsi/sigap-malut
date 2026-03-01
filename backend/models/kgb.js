import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

let Kgb;
if (sequelize.models && sequelize.models.kgb) {
  Kgb = sequelize.models.kgb;
} else {
  Kgb = sequelize.define(
    "kgb",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      layanan_id: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB },
    },
    { tableName: "kgb" },
  );
}

export default Kgb;
