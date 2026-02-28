export default (sequelize, DataTypes) => {
  const monitoring_realisasi = sequelize.define('monitoring_realisasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'monitoring_realisasi' });
  

monitoring_realisasi.associate = (models) => {
  monitoring_realisasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return monitoring_realisasi;
};
