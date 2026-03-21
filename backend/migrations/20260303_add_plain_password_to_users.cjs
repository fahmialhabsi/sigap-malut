// Migration: add `plain_password` column to users for admin-managed plaintext display

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kolom 'plain_password' sudah ada, tidak perlu ditambah lagi
    // await queryInterface.addColumn("users", "plain_password", { ... });
  },
  down: async (queryInterface) => {
    // Jangan hapus kolom 'plain_password'
    // await queryInterface.removeColumn("users", "plain_password");
  },
};
