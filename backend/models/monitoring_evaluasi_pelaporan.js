export default (sequelize, DataTypes) => {
  const monitoring_evaluasi_pelaporan = sequelize.define('monitoring_evaluasi_pelaporan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_evaluasi_pelaporan' });
  

monitoring_evaluasi_pelaporan.associate = (models) => {
  monitoring_evaluasi_pelaporan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_evaluasi_pelaporan;
};
