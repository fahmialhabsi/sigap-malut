import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA10 = sequelize.define(
    "SA10",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      ai_service: { type: DataTypes.STRING, allowNull: false },
      api_key: { type: DataTypes.STRING, allowNull: true },
      api_endpoint: { type: DataTypes.STRING, allowNull: true },
      model_name: { type: DataTypes.STRING, allowNull: true },
      temperature: { type: DataTypes.FLOAT, allowNull: true },
      max_tokens: { type: DataTypes.INTEGER, allowNull: true },
      features_enabled: { type: DataTypes.JSONB, allowNull: true },
      classification_accuracy: { type: DataTypes.FLOAT, allowNull: true },
      total_requests: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      status: { type: DataTypes.STRING, defaultValue: "aktif" },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "sa10", timestamps: false },
  );
  return SA10;
};
