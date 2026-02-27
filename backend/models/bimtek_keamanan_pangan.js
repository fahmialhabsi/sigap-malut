export default (sequelize, DataTypes) => {
  const bimtek_keamanan_pangan = sequelize.define('bimtek_keamanan_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'bimtek_keamanan_pangan' });
  

bimtek_keamanan_pangan.associate = (models) => {
  bimtek_keamanan_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return bimtek_keamanan_pangan;
};
