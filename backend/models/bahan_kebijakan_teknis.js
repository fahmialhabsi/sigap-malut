export default (sequelize, DataTypes) => {
  const bahan_kebijakan_teknis = sequelize.define('bahan_kebijakan_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bahan_kebijakan_teknis' });
  

bahan_kebijakan_teknis.associate = (models) => {
  bahan_kebijakan_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bahan_kebijakan_teknis;
};
