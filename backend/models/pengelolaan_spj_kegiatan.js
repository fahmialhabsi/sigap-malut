export default (sequelize, DataTypes) => {
  const pengelolaan_spj_kegiatan = sequelize.define('pengelolaan_spj_kegiatan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_spj_kegiatan' });
  

pengelolaan_spj_kegiatan.associate = (models) => {
  pengelolaan_spj_kegiatan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_spj_kegiatan;
};
