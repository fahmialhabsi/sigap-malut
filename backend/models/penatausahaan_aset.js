export default (sequelize, DataTypes) => {
  const penatausahaan_aset = sequelize.define('penatausahaan_aset', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penatausahaan_aset' });
  

penatausahaan_aset.associate = (models) => {
  penatausahaan_aset.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penatausahaan_aset;
};
