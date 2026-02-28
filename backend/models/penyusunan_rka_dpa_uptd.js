export default (sequelize, DataTypes) => {
  const penyusunan_rka_dpa_uptd = sequelize.define('penyusunan_rka_dpa_uptd', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_rka_dpa_uptd' });
  

penyusunan_rka_dpa_uptd.associate = (models) => {
  penyusunan_rka_dpa_uptd.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_rka_dpa_uptd;
};
