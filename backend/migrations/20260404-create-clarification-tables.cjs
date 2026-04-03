/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clarification_threads", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      anchor_type: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      anchor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lane: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      participant_user_ids: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.addIndex(
      "clarification_threads",
      ["anchor_type", "anchor_id", "lane"],
      {
        unique: true,
        name: "clarification_threads_anchor_lane_unique",
      },
    );

    await queryInterface.createTable("clarification_messages", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thread_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "clarification_threads", key: "id" },
        onDelete: "CASCADE",
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("clarification_messages", ["thread_id"], {
      name: "clarification_messages_thread_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("clarification_messages");
    await queryInterface.dropTable("clarification_threads");
  },
};
