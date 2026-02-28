export default (sequelize, DataTypes) => {
  const penjadwalan_audit_inspeksi = sequelize.define('penjadwalan_audit_inspeksi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penjadwalan_audit_inspeksi' });
  

penjadwalan_audit_inspeksi.associate = (models) => {
  penjadwalan_audit_inspeksi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penjadwalan_audit_inspeksi;
};
