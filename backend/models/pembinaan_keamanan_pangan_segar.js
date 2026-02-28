export default (sequelize, DataTypes) => {
  const pembinaan_keamanan_pangan_segar = sequelize.define('pembinaan_keamanan_pangan_segar', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pembinaan_keamanan_pangan_segar' });
  

pembinaan_keamanan_pangan_segar.associate = (models) => {
  pembinaan_keamanan_pangan_segar.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pembinaan_keamanan_pangan_segar;
};
