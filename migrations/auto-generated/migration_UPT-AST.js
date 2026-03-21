export async function up({ context: queryInterface }) {
  await queryInterface.createTable('UPT-AST', {
      unit_kerja: { type: DataTypes.ENUM, allowNull: false, defaultValue: "UPTD" },
      lokasi_unit: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "UPTD Balai Pengawasan Mutu" },
      kategori_aset_uptd: { type: DataTypes.ENUM, allowNull: true },
      akses_terbatas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: "1" },
    });
}

export async function down({ context: queryInterface }) {
  await queryInterface.dropTable('UPT-AST');
}
