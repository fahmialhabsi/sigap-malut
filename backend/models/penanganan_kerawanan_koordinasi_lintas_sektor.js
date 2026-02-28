export default (sequelize, DataTypes) => {
  const penanganan_kerawanan_koordinasi_lintas_sektor = sequelize.define('penanganan_kerawanan_koordinasi_lintas_sektor', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penanganan_kerawanan_koordinasi_lintas_sektor' });
  

penanganan_kerawanan_koordinasi_lintas_sektor.associate = (models) => {
  penanganan_kerawanan_koordinasi_lintas_sektor.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penanganan_kerawanan_koordinasi_lintas_sektor;
};
