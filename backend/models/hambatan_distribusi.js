export default (sequelize, DataTypes) => {
  const hambatan_distribusi = sequelize.define('hambatan_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'hambatan_distribusi' });
  

hambatan_distribusi.associate = (models) => {
  hambatan_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return hambatan_distribusi;
};
