export default (sequelize, DataTypes) => {
  const pemeliharaan_aset = sequelize.define('pemeliharaan_aset', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pemeliharaan_aset' });
  

pemeliharaan_aset.associate = (models) => {
  pemeliharaan_aset.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pemeliharaan_aset;
};
