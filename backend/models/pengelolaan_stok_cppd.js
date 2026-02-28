export default (sequelize, DataTypes) => {
  const pengelolaan_stok_cppd = sequelize.define('pengelolaan_stok_cppd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_stok_cppd' });
  

pengelolaan_stok_cppd.associate = (models) => {
  pengelolaan_stok_cppd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_stok_cppd;
};
