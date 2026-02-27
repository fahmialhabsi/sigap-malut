export default (sequelize, DataTypes) => {
  const kebijakan_penyusunan_pedoman_teknis = sequelize.define('kebijakan_penyusunan_pedoman_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_penyusunan_pedoman_teknis' });
  

kebijakan_penyusunan_pedoman_teknis.associate = (models) => {
  kebijakan_penyusunan_pedoman_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_penyusunan_pedoman_teknis;
};
