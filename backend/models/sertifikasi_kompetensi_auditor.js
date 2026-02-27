export default (sequelize, DataTypes) => {
  const sertifikasi_kompetensi_auditor = sequelize.define('sertifikasi_kompetensi_auditor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sertifikasi_kompetensi_auditor' });
  

sertifikasi_kompetensi_auditor.associate = (models) => {
  sertifikasi_kompetensi_auditor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sertifikasi_kompetensi_auditor;
};
