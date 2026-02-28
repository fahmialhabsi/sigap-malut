export default (sequelize, DataTypes) => {
  const pengelolaan_alat_inspeksi = sequelize.define('pengelolaan_alat_inspeksi', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengelolaan_alat_inspeksi' });
  

pengelolaan_alat_inspeksi.associate = (models) => {
  pengelolaan_alat_inspeksi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengelolaan_alat_inspeksi;
};
