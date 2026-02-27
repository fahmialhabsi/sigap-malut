export default (sequelize, DataTypes) => {
  const penyusunan_skp_jf_pelaksana = sequelize.define('penyusunan_skp_jf_pelaksana', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penyusunan_skp_jf_pelaksana' });
  

penyusunan_skp_jf_pelaksana.associate = (models) => {
  penyusunan_skp_jf_pelaksana.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penyusunan_skp_jf_pelaksana;
};
