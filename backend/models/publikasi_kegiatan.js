export default (sequelize, DataTypes) => {
  const publikasi_kegiatan = sequelize.define('publikasi_kegiatan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'publikasi_kegiatan' });
  

publikasi_kegiatan.associate = (models) => {
  publikasi_kegiatan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return publikasi_kegiatan;
};
