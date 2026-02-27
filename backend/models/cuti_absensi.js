export default (sequelize, DataTypes) => {
  const cuti_absensi = sequelize.define(
    "cuti_absensi",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      layanan_id: { type: DataTypes.UUID, allowNull: false },
      kode_layanan: { type: DataTypes.STRING, allowNull: false },
      nama_layanan: { type: DataTypes.STRING, allowNull: false },
      bidang_penanggung_jawab: { type: DataTypes.STRING, allowNull: false },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      jenis_output: { type: DataTypes.STRING, allowNull: false },
      sla: { type: DataTypes.INTEGER, allowNull: false },
      aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "cuti_absensi", timestamps: true },
  );
  

cuti_absensi.associate = (models) => {
  cuti_absensi.belongsTo(models.Layanan, { foreignKey: "layanan_id", as: "layanan" });
};
return cuti_absensi;
};
