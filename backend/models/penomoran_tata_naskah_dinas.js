export default (sequelize, DataTypes) => {
  const penomoran_tata_naskah_dinas = sequelize.define('penomoran_tata_naskah_dinas', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'penomoran_tata_naskah_dinas' });
  

penomoran_tata_naskah_dinas.associate = (models) => {
  penomoran_tata_naskah_dinas.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return penomoran_tata_naskah_dinas;
};
