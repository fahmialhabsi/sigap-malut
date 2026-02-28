export default (sequelize, DataTypes) => {
  const konsultasi_teknis_konsumsi = sequelize.define('konsultasi_teknis_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'konsultasi_teknis_konsumsi' });
  

konsultasi_teknis_konsumsi.associate = (models) => {
  konsultasi_teknis_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return konsultasi_teknis_konsumsi;
};
