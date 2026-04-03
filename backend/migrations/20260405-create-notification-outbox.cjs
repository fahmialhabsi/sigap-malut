/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notification_outbox", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_key: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      channel: {
        type: Sequelize.STRING(32),
        allowNull: false,
        comment: "SOCKET | IN_APP_REDUNDANT",
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      next_retry_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("notification_outbox", ["status", "next_retry_at"], {
      name: "notification_outbox_status_retry_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notification_outbox");
  },
};
