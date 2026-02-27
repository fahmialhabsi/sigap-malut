import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA09 = sequelize.define(
    "SA09",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      periode: { type: DataTypes.DATE, allowNull: false },
      compliance_percentage: { type: DataTypes.FLOAT, allowNull: true },
      target_compliance: { type: DataTypes.FLOAT, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "on_target" },
      bypass_details: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "sa09", timestamps: true },
  );
  return SA09;
};
