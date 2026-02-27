export default (sequelize, DataTypes) => {
  const rencana_realisasi_distribusi = sequelize.define('rencana_realisasi_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'rencana_realisasi_distribusi' });
  

rencana_realisasi_distribusi.associate = (models) => {
  rencana_realisasi_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return rencana_realisasi_distribusi;
};
