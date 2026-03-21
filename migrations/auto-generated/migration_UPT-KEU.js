export async function up({ context: queryInterface }) {
  await queryInterface.createTable('UPT-KEU', {
      unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
      kode_unit: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "01" },
      akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('UPT-KEU');
}
