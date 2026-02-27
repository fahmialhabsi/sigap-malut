export default (sequelize, DataTypes) => {
  const distribusi_perlengkapan_kerja = sequelize.define('distribusi_perlengkapan_kerja', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'distribusi_perlengkapan_kerja' });
  

distribusi_perlengkapan_kerja.associate = (models) => {
  distribusi_perlengkapan_kerja.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return distribusi_perlengkapan_kerja;
};
