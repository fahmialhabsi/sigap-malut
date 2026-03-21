export async function up({ context: queryInterface }) {
  await queryInterface.createTable('UPT-ADM', {
      unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
      akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('UPT-ADM');
}
