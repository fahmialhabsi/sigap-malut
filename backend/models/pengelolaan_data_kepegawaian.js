export default (sequelize, DataTypes) => {
  const pengelolaan_data_kepegawaian = sequelize.define('pengelolaan_data_kepegawaian', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_data_kepegawaian' });
  

pengelolaan_data_kepegawaian.associate = (models) => {
  pengelolaan_data_kepegawaian.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
  pengelolaan_data_kepegawaian.belongsTo(models.Pegawai, { foreignKey: "pegawai_id", as: "pegawai" });
};
return pengelolaan_data_kepegawaian;
};
