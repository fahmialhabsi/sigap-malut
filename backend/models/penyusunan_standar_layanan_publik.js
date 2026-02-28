export default (sequelize, DataTypes) => {
  const penyusunan_standar_layanan_publik = sequelize.define('penyusunan_standar_layanan_publik', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_standar_layanan_publik' });
  

penyusunan_standar_layanan_publik.associate = (models) => {
  penyusunan_standar_layanan_publik.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_standar_layanan_publik;
};
