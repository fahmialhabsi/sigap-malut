export default (sequelize, DataTypes) => {
  const sistem_informasi_pangan = sequelize.define('sistem_informasi_pangan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'sistem_informasi_pangan' });
  

sistem_informasi_pangan.associate = (models) => {
  sistem_informasi_pangan.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return sistem_informasi_pangan;
};
