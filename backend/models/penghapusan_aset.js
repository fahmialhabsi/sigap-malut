export default (sequelize, DataTypes) => {
  const penghapusan_aset = sequelize.define('penghapusan_aset', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penghapusan_aset' });
  

penghapusan_aset.associate = (models) => {
  penghapusan_aset.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penghapusan_aset;
};
