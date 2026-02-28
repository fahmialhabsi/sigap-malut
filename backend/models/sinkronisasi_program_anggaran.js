export default (sequelize, DataTypes) => {
  const sinkronisasi_program_anggaran = sequelize.define('sinkronisasi_program_anggaran', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sinkronisasi_program_anggaran' });
  

sinkronisasi_program_anggaran.associate = (models) => {
  sinkronisasi_program_anggaran.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sinkronisasi_program_anggaran;
};
