export default (sequelize, DataTypes) => {
  const sosialisasi_pangan_aman = sequelize.define('sosialisasi_pangan_aman', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sosialisasi_pangan_aman' });
  

sosialisasi_pangan_aman.associate = (models) => {
  sosialisasi_pangan_aman.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sosialisasi_pangan_aman;
};
