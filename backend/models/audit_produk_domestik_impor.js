export default (sequelize, DataTypes) => {
  const audit_produk_domestik_impor = sequelize.define('audit_produk_domestik_impor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'audit_produk_domestik_impor' });
  

audit_produk_domestik_impor.associate = (models) => {
  audit_produk_domestik_impor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return audit_produk_domestik_impor;
};
