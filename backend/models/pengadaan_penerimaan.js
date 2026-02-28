export default (sequelize, DataTypes) => {
  const pengadaan_penerimaan = sequelize.define('pengadaan_penerimaan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengadaan_penerimaan' });
  

pengadaan_penerimaan.associate = (models) => {
  pengadaan_penerimaan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengadaan_penerimaan;
};
