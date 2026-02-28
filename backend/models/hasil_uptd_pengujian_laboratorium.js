export default (sequelize, DataTypes) => {
  const hasil_uptd_pengujian_laboratorium = sequelize.define('hasil_uptd_pengujian_laboratorium', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'hasil_uptd_pengujian_laboratorium' });
  

hasil_uptd_pengujian_laboratorium.associate = (models) => {
  hasil_uptd_pengujian_laboratorium.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return hasil_uptd_pengujian_laboratorium;
};
