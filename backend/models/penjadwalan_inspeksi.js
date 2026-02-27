export default (sequelize, DataTypes) => {
  const penjadwalan_inspeksi = sequelize.define('penjadwalan_inspeksi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penjadwalan_inspeksi' });
  

penjadwalan_inspeksi.associate = (models) => {
  penjadwalan_inspeksi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penjadwalan_inspeksi;
};
