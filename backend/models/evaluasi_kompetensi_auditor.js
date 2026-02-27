export default (sequelize, DataTypes) => {
  const evaluasi_kompetensi_auditor = sequelize.define('evaluasi_kompetensi_auditor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_kompetensi_auditor' });
  

evaluasi_kompetensi_auditor.associate = (models) => {
  evaluasi_kompetensi_auditor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_kompetensi_auditor;
};
