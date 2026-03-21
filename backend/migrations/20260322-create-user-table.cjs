// Migration: Create user table sesuai dokumenSistem (UUID PK, role, bidang)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id_user: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        // FK ke tabel roles (opsional, bisa ditambah constraint FK jika tabel roles sudah ada)
      },
      bidang: {
        type: Sequelize.STRING,
        allowNull: false,
        // FK ke tabel bidang (opsional, bisa ditambah constraint FK jika tabel bidang sudah ada)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
  },
};
