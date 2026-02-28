export default (sequelize, DataTypes) => {
  const pengusulan_penilaian_kinerja = sequelize.define('pengusulan_penilaian_kinerja', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'pengusulan_penilaian_kinerja' });
  

pengusulan_penilaian_kinerja.associate = (models) => {
  pengusulan_penilaian_kinerja.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return pengusulan_penilaian_kinerja;
};
