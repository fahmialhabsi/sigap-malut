import { DataTypes } from "sequelize";
export default (sequelize) => {
  const SA03 = sequelize.define(
    "SA03",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nama_template: { type: DataTypes.STRING, allowNull: false },
      kode_template: { type: DataTypes.STRING, allowNull: false },
      bidang: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Super Admin",
      },
      deskripsi: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "draft" },
      payload: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "sa03", timestamps: true },
  );
  return SA03;
};
