export default (sequelize, DataTypes) => {
  const pengambilan_sampel_pangan = sequelize.define('pengambilan_sampel_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengambilan_sampel_pangan' });
  

pengambilan_sampel_pangan.associate = (models) => {
  pengambilan_sampel_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengambilan_sampel_pangan;
};
