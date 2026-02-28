export default (sequelize, DataTypes) => {
  const supervisi_audit_lapangan = sequelize.define('supervisi_audit_lapangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'supervisi_audit_lapangan' });
  

supervisi_audit_lapangan.associate = (models) => {
  supervisi_audit_lapangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return supervisi_audit_lapangan;
};
