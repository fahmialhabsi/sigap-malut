export async function up({ context: queryInterface }) {
  await queryInterface.createTable('UPT-KEP', {
      unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
      akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
      hak_akses_uptd: { type: DataTypes.ENUM, allowNull: false, defaultValue: "read_write" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('UPT-KEP');
}
