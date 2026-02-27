export default (sequelize, DataTypes) => {
  const penetapan_jalur_distribusi = sequelize.define('penetapan_jalur_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penetapan_jalur_distribusi' });
  

penetapan_jalur_distribusi.associate = (models) => {
  penetapan_jalur_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penetapan_jalur_distribusi;
};
