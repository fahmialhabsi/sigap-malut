export default (sequelize, DataTypes) => {
  const fasilitasi_kelancaran_distribusi = sequelize.define('fasilitasi_kelancaran_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitasi_kelancaran_distribusi' });
  

fasilitasi_kelancaran_distribusi.associate = (models) => {
  fasilitasi_kelancaran_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return fasilitasi_kelancaran_distribusi;
};
