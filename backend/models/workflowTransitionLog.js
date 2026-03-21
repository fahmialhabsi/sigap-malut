import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const WorkflowTransitionLog = sequelize.define("WorkflowTransitionLog", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  workflow_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  from_step: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to_step: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  actor_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default WorkflowTransitionLog;
