import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SpipEvidenceLink = sequelize.define(
  "SpipEvidenceLink",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    spip_ref_type: { type: DataTypes.ENUM("risk", "rtp", "monitoring"), allowNull: false },
    spip_ref_id: { type: DataTypes.INTEGER, allowNull: false },
    sumber_modul: { type: DataTypes.STRING(100), allowNull: false },
    sumber_tabel: { type: DataTypes.STRING(120), allowNull: true },
    sumber_id: { type: DataTypes.STRING(120), allowNull: true },
    judul: { type: DataTypes.TEXT, allowNull: true },
    url: { type: DataTypes.STRING(700), allowNull: true },
    occurred_at: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.STRING(100), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "spip_evidence_link",
    timestamps: false,
  },
);

export default SpipEvidenceLink;

