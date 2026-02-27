export default (sequelize, DataTypes) => {
  const kebijakan_sinkronisasi_pusat_daerah = sequelize.define('kebijakan_sinkronisasi_pusat_daerah', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'kebijakan_sinkronisasi_pusat_daerah' });
  

kebijakan_sinkronisasi_pusat_daerah.associate = (models) => {
  kebijakan_sinkronisasi_pusat_daerah.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return kebijakan_sinkronisasi_pusat_daerah;
};
