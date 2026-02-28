export default (sequelize, DataTypes) => {
  const hasil_pengujian_gmp_ghp_nkv = sequelize.define('hasil_pengujian_gmp_ghp_nkv', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'hasil_pengujian_gmp_ghp_nkv' });
  

hasil_pengujian_gmp_ghp_nkv.associate = (models) => {
  hasil_pengujian_gmp_ghp_nkv.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return hasil_pengujian_gmp_ghp_nkv;
};
