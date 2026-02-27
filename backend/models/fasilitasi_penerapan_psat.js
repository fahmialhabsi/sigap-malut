export default (sequelize, DataTypes) => {
  const fasilitasi_penerapan_psat = sequelize.define('fasilitasi_penerapan_psat', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitasi_penerapan_psat' });
  

fasilitasi_penerapan_psat.associate = (models) => {
  fasilitasi_penerapan_psat.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return fasilitasi_penerapan_psat;
};
