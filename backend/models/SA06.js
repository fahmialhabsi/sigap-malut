import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA06 = sequelize.define(
    "SA06",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      modul: { type: DataTypes.STRING, allowNull: false },
      entitas_id: { type: DataTypes.UUID, allowNull: false },
      aksi: { type: DataTypes.STRING, allowNull: false },
      data_lama: { type: DataTypes.JSONB, allowNull: true },
      data_baru: { type: DataTypes.JSONB, allowNull: true },
      pegawai_id: { type: DataTypes.UUID, allowNull: false },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: { type: DataTypes.STRING, defaultValue: "log" },
    },
    { tableName: "sa06", timestamps: false },
  );

  SA06.associate = (models) => {
  SA06.belongsTo(models.Entitas, { foreignKey: "entitas_id", as: "entitas" });
  SA06.belongsTo(models.Pegawai, { foreignKey: "pegawai_id", as: "pegawai" });
};

  return SA06;
};
