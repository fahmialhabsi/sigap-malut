export default (sequelize, DataTypes) => {
  const peta_distribusi_pangan = sequelize.define('peta_distribusi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'peta_distribusi_pangan' });
  

peta_distribusi_pangan.associate = (models) => {
  peta_distribusi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return peta_distribusi_pangan;
};
