export default (sequelize, DataTypes) => {
  const fasilitasi_program_bidang = sequelize.define(
    "fasilitasi_program_bidang",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      layanan_id: { type: DataTypes.UUID },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB },
    },
    { tableName: "fasilitasi_program_bidang" },
  );

  fasilitasi_program_bidang.associate = (models) => {
    fasilitasi_program_bidang.belongsTo(models.Layanan, {
      foreignKey: "layanan_id",
      as: "layanan",
    });
    // NOTE: removed incorrect association to `User` using foreignKey 'bidang'
    // that caused queries to expect a non-existent `bidang` column in `users`.
    // If a relation is required, re-add with the correct FK that exists
    // in the `users` table (e.g. `unit_id` or `unit_kerja`) after schema review.
  };
  return fasilitasi_program_bidang;
};
