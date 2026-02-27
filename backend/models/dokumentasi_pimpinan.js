export default (sequelize, DataTypes) => {
  const dokumentasi_pimpinan = sequelize.define('dokumentasi_pimpinan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'dokumentasi_pimpinan' });
  

dokumentasi_pimpinan.associate = (models) => {
  dokumentasi_pimpinan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return dokumentasi_pimpinan;
};
