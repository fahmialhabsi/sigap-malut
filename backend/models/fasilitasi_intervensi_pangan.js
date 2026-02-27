export default (sequelize, DataTypes) => {
  const fasilitasi_intervensi_pangan = sequelize.define('fasilitasi_intervensi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitasi_intervensi_pangan' });
  

fasilitasi_intervensi_pangan.associate = (models) => {
  fasilitasi_intervensi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return fasilitasi_intervensi_pangan;
};
