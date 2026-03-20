module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tabel dan kolom sudah ada, tidak perlu createTable atau addColumn lagi
  },
  down: async (queryInterface, Sequelize) => {
    // Jangan hapus tabel atau kolom apapun
  },
};
