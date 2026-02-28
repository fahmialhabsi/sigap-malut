export default (sequelize, DataTypes) => {
  const inventarisasi_aset_uptd = sequelize.define('inventarisasi_aset_uptd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'inventarisasi_aset_uptd' });
  

inventarisasi_aset_uptd.associate = (models) => {
  inventarisasi_aset_uptd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return inventarisasi_aset_uptd;
};
