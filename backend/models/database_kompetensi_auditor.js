export default (sequelize, DataTypes) => {
  const database_kompetensi_auditor = sequelize.define('database_kompetensi_auditor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'database_kompetensi_auditor' });
  

database_kompetensi_auditor.associate = (models) => {
  database_kompetensi_auditor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
  database_kompetensi_auditor.belongsTo(models.Auditor, { foreignKey: "auditor_id", as: "auditor" });
};
return database_kompetensi_auditor;
};
