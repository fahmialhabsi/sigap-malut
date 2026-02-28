export default (sequelize, DataTypes) => {
  const kebijakan_distribusi_pangan = sequelize.define('kebijakan_distribusi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_distribusi_pangan' });
  

kebijakan_distribusi_pangan.associate = (models) => {
  kebijakan_distribusi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_distribusi_pangan;
};
