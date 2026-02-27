export default (sequelize, DataTypes) => {
  const review_pemutakhiran_sop = sequelize.define('review_pemutakhiran_sop', {
    id: { type: DataTypes.UUID, primaryKey: true },
    layanan_id: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'draft' },
    payload: { type: DataTypes.JSONB }
  }, { tableName: 'review_pemutakhiran_sop' });
  

review_pemutakhiran_sop.associate = (models) => {
  review_pemutakhiran_sop.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return review_pemutakhiran_sop;
};
