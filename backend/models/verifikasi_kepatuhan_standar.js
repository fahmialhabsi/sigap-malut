export default (sequelize, DataTypes) => {
  const verifikasi_kepatuhan_standar = sequelize.define('verifikasi_kepatuhan_standar', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'verifikasi_kepatuhan_standar' });
  

verifikasi_kepatuhan_standar.associate = (models) => {
  verifikasi_kepatuhan_standar.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return verifikasi_kepatuhan_standar;
};
