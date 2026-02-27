export default (sequelize, DataTypes) => {
  const audit_sertifikasi = sequelize.define('audit_sertifikasi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'audit_sertifikasi' });
  

audit_sertifikasi.associate = (models) => {
  audit_sertifikasi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return audit_sertifikasi;
};
