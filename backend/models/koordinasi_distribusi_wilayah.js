export default (sequelize, DataTypes) => {
  const koordinasi_distribusi_wilayah = sequelize.define('koordinasi_distribusi_wilayah', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'koordinasi_distribusi_wilayah' });
  

koordinasi_distribusi_wilayah.associate = (models) => {
  koordinasi_distribusi_wilayah.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return koordinasi_distribusi_wilayah;
};
