export default (sequelize, DataTypes) => {
  const penyusunan_renstra = sequelize.define('penyusunan_renstra', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_renstra' });
  

penyusunan_renstra.associate = (models) => {
  penyusunan_renstra.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_renstra;
};
