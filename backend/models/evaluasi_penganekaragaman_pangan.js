export default (sequelize, DataTypes) => {
  const evaluasi_penganekaragaman_pangan = sequelize.define('evaluasi_penganekaragaman_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_penganekaragaman_pangan' });
  

evaluasi_penganekaragaman_pangan.associate = (models) => {
  evaluasi_penganekaragaman_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_penganekaragaman_pangan;
};
