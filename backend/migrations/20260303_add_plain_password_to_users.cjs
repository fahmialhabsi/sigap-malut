// Migration: add `plain_password` column to users for admin-managed plaintext display

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "plain_password", {
      type: Sequelize.STRING(512),
      allowNull: true,
      comment: "Plaintext password (admin only; use with caution)",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("users", "plain_password");
  },
};
