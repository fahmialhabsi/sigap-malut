import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA08 = sequelize.define(
    "SA08",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      backup_type: { type: DataTypes.STRING, allowNull: false },
      backup_name: { type: DataTypes.STRING, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_size: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { tableName: "sa08", timestamps: false },
  );

  SA08.associate = (models) => {
    SA08.belongsTo(models.SA05, { foreignKey: "created_by", as: "creator" });
  };

  return SA08;
};
