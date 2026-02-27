export default (sequelize, DataTypes) => {
  const pengamanan_aset = sequelize.define('pengamanan_aset', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengamanan_aset' });
  

pengamanan_aset.associate = (models) => {
  pengamanan_aset.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengamanan_aset;
};
