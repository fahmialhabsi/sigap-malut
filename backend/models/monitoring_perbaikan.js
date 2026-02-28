export default (sequelize, DataTypes) => {
  const monitoring_perbaikan = sequelize.define('monitoring_perbaikan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_perbaikan' });
  

monitoring_perbaikan.associate = (models) => {
  monitoring_perbaikan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_perbaikan;
};
