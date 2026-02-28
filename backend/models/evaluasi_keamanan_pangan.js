export default (sequelize, DataTypes) => {
  const evaluasi_keamanan_pangan = sequelize.define('evaluasi_keamanan_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_keamanan_pangan' });
  

evaluasi_keamanan_pangan.associate = (models) => {
  evaluasi_keamanan_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_keamanan_pangan;
};
