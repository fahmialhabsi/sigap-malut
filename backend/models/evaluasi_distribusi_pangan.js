export default (sequelize, DataTypes) => {
  const evaluasi_distribusi_pangan = sequelize.define('evaluasi_distribusi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_distribusi_pangan' });
  

evaluasi_distribusi_pangan.associate = (models) => {
  evaluasi_distribusi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_distribusi_pangan;
};
