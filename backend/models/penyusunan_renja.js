export default (sequelize, DataTypes) => {
  const penyusunan_renja = sequelize.define('penyusunan_renja', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_renja' });
  

penyusunan_renja.associate = (models) => {
  penyusunan_renja.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_renja;
};
