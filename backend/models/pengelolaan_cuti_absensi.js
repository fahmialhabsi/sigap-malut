export default (sequelize, DataTypes) => {
  const pengelolaan_cuti_absensi = sequelize.define('pengelolaan_cuti_absensi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_cuti_absensi' });
  

pengelolaan_cuti_absensi.associate = (models) => {
  pengelolaan_cuti_absensi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_cuti_absensi;
};
