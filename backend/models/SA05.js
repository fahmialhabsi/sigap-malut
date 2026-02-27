import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA05 = sequelize.define(
    "SA05",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: "aktif" },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "sa05", timestamps: true },
  );
  return SA05;
};
