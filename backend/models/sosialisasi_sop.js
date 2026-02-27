export default (sequelize, DataTypes) => {
  const sosialisasi_sop = sequelize.define('sosialisasi_sop', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sosialisasi_sop' });
  

sosialisasi_sop.associate = (models) => {
  sosialisasi_sop.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sosialisasi_sop;
};
