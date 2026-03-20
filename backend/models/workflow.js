import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Workflow = sequelize.define("Workflow", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  institution_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  definition: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  current_step: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "draft",
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Workflow;
