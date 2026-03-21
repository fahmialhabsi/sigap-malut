// Migration: Create approval_log table sesuai dokumenSistem (UUID PK, layanan_id, reviewer_id, action, catatan, timestamp)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("approval_log", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      layanan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        // FK ke layanan (opsional, bisa ditambah constraint FK jika tabel layanan sudah ada)
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        // FK ke user (opsional, bisa ditambah constraint FK jika tabel user sudah ada)
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      catatan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("approval_log");
  },
};
