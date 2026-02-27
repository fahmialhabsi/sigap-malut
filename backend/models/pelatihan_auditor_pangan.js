export default (sequelize, DataTypes) => {
  const pelatihan_auditor_pangan = sequelize.define('pelatihan_auditor_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelatihan_auditor_pangan' });
  

pelatihan_auditor_pangan.associate = (models) => {
  pelatihan_auditor_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelatihan_auditor_pangan;
};
