export default (sequelize, DataTypes) => {
  const pelayanan_informasi_layanan = sequelize.define('pelayanan_informasi_layanan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pelayanan_informasi_layanan' });
  

pelayanan_informasi_layanan.associate = (models) => {
  pelayanan_informasi_layanan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pelayanan_informasi_layanan;
};
