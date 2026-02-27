export default (sequelize, DataTypes) => {
  const bimtek_distribusi_pangan = sequelize.define('bimtek_distribusi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimtek_distribusi_pangan' });
  

bimtek_distribusi_pangan.associate = (models) => {
  bimtek_distribusi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimtek_distribusi_pangan;
};
