export default (sequelize, DataTypes) => {
  const pengujian_sampel_pangan_berisiko = sequelize.define('pengujian_sampel_pangan_berisiko', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengujian_sampel_pangan_berisiko' });
  

pengujian_sampel_pangan_berisiko.associate = (models) => {
  pengujian_sampel_pangan_berisiko.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengujian_sampel_pangan_berisiko;
};
