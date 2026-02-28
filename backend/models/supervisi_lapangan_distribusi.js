export default (sequelize, DataTypes) => {
  const supervisi_lapangan_distribusi = sequelize.define('supervisi_lapangan_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'supervisi_lapangan_distribusi' });
  

supervisi_lapangan_distribusi.associate = (models) => {
  supervisi_lapangan_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return supervisi_lapangan_distribusi;
};
