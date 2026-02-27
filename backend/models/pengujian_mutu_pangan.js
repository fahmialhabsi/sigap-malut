export default (sequelize, DataTypes) => {
  const pengujian_mutu_pangan = sequelize.define('pengujian_mutu_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengujian_mutu_pangan' });
  

pengujian_mutu_pangan.associate = (models) => {
  pengujian_mutu_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengujian_mutu_pangan;
};
