export default (sequelize, DataTypes) => {
  const revisi_anggaran = sequelize.define('revisi_anggaran', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'revisi_anggaran' });
  

revisi_anggaran.associate = (models) => {
  revisi_anggaran.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return revisi_anggaran;
};
