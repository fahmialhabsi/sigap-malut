export default (sequelize, DataTypes) => {
  const fasilitasi_program_bidang = sequelize.define('fasilitasi_program_bidang', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'fasilitasi_program_bidang' });
  

fasilitasi_program_bidang.associate = (models) => {
fasilitasi_program_bidang.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
  fasilitasi_program_bidang.hasMany(models.User, { foreignKey: "bidang", as: "users" });
};
return fasilitasi_program_bidang;
};
