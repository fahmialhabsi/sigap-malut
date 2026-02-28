export default (sequelize, DataTypes) => {
  const pedoman_teknis_distribusi = sequelize.define('pedoman_teknis_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pedoman_teknis_distribusi' });
  

pedoman_teknis_distribusi.associate = (models) => {
  pedoman_teknis_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pedoman_teknis_distribusi;
};
