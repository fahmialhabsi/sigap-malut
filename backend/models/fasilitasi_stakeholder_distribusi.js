export default (sequelize, DataTypes) => {
  const fasilitasi_stakeholder_distribusi = sequelize.define('fasilitasi_stakeholder_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitasi_stakeholder_distribusi' });
  

fasilitasi_stakeholder_distribusi.associate = (models) => {
  fasilitasi_stakeholder_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return fasilitasi_stakeholder_distribusi;
};
