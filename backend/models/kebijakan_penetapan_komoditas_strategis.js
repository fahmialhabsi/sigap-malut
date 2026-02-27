export default (sequelize, DataTypes) => {
  const kebijakan_penetapan_komoditas_strategis = sequelize.define('kebijakan_penetapan_komoditas_strategis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_penetapan_komoditas_strategis' });
  

kebijakan_penetapan_komoditas_strategis.associate = (models) => {
  kebijakan_penetapan_komoditas_strategis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_penetapan_komoditas_strategis;
};
