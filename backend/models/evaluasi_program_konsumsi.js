export default (sequelize, DataTypes) => {
  const evaluasi_program_konsumsi = sequelize.define('evaluasi_program_konsumsi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'evaluasi_program_konsumsi' });
  

evaluasi_program_konsumsi.associate = (models) => {
  evaluasi_program_konsumsi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return evaluasi_program_konsumsi;
};
