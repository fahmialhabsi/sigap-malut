export default (sequelize, DataTypes) => {
  const konsultasi_teknis = sequelize.define('konsultasi_teknis', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'konsultasi_teknis' });
  

konsultasi_teknis.associate = (models) => {
  konsultasi_teknis.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return konsultasi_teknis;
};
