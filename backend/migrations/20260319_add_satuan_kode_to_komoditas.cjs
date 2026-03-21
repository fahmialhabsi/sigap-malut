// Migration: Tambah kolom 'satuan' dan 'kode' ke tabel komoditas

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("komoditas", "satuan", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "Satuan, e.g., kg",
    });
    await queryInterface.addColumn("komoditas", "kode", {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "Kode komoditas",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("komoditas", "satuan");
    await queryInterface.removeColumn("komoditas", "kode");
  },
};
