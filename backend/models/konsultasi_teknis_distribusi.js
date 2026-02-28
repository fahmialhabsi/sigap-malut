export default (sequelize, DataTypes) => {
  const konsultasi_teknis_distribusi = sequelize.define('konsultasi_teknis_distribusi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'konsultasi_teknis_distribusi' });
  

konsultasi_teknis_distribusi.associate = (models) => {
  konsultasi_teknis_distribusi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return konsultasi_teknis_distribusi;
};
