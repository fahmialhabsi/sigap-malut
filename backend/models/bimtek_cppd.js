export default (sequelize, DataTypes) => {
  const bimtek_cppd = sequelize.define('bimtek_cppd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimtek_cppd' });
  

bimtek_cppd.associate = (models) => {
  bimtek_cppd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimtek_cppd;
};
