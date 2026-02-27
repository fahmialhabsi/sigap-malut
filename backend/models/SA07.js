import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA07 = sequelize.define(
    "SA07",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      config_key: { type: DataTypes.STRING, allowNull: false },
      config_value: { type: DataTypes.JSONB, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "aktif" },
    },
    { tableName: "sa07", timestamps: true },
  );
  return SA07;
};
