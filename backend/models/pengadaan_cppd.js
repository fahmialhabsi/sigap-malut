export default (sequelize, DataTypes) => {
  const pengadaan_cppd = sequelize.define('pengadaan_cppd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengadaan_cppd' });
  

pengadaan_cppd.associate = (models) => {
  pengadaan_cppd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengadaan_cppd;
};
