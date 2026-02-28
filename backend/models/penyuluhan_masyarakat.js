export default (sequelize, DataTypes) => {
  const penyuluhan_masyarakat = sequelize.define('penyuluhan_masyarakat', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyuluhan_masyarakat' });
  

penyuluhan_masyarakat.associate = (models) => {
  penyuluhan_masyarakat.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyuluhan_masyarakat;
};
