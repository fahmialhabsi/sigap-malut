import { DataTypes } from "sequelize";
export default (sequelize) => {
  const ModuleGenerator = sequelize.define(
    "ModuleGenerator",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      label: { type: DataTypes.STRING, allowNull: false },
      schema: { type: DataTypes.JSONB, allowNull: true },
      api: { type: DataTypes.JSONB, allowNull: true },
      permissions: { type: DataTypes.JSONB, allowNull: true },
      template: { type: DataTypes.JSONB, allowNull: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: { type: DataTypes.STRING, defaultValue: "active" },
    },
    { tableName: "module_generator", timestamps: false },
  );
  

ModuleGenerator.associate = (models) => {
  ModuleGenerator.belongsTo(models.Modul, { foreignKey: "modul_id", as: "modul" });
};
return ModuleGenerator;
};
