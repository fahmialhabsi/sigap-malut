export default (sequelize, DataTypes) => {
  const audit_ulang = sequelize.define('audit_ulang', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'audit_ulang' });
  

audit_ulang.associate = (models) => {
  audit_ulang.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return audit_ulang;
};
