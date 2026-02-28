export default (sequelize, DataTypes) => {
  const penyusunan_rka_dpa = sequelize.define('penyusunan_rka_dpa', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_rka_dpa' });
  

penyusunan_rka_dpa.associate = (models) => {
  penyusunan_rka_dpa.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_rka_dpa;
};
