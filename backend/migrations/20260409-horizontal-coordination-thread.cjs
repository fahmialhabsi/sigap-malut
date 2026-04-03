/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("horizontal_coordination_requests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      execution_thread_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      coordination_kind: {
        type: Sequelize.STRING(48),
        allowNull: false,
        defaultValue: "sync_request",
      },
      status: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: "diajukan",
      },
      subject: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      from_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      to_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      from_unit: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      to_unit: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      from_org_level: {
        type: Sequelize.STRING(32),
        allowNull: true,
        defaultValue: "sekretaris",
      },
      to_org_level: {
        type: Sequelize.STRING(32),
        allowNull: true,
        defaultValue: "kabid",
      },
      sla_due_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      response_body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      responded_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      surat_masuk_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      task_id: {
        type: Sequelize.INTEGER,
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

    await queryInterface.addIndex(
      "horizontal_coordination_requests",
      ["execution_thread_id"],
      {
        name: "idx_hcoord_thread",
      },
    );
    await queryInterface.addIndex(
      "horizontal_coordination_requests",
      ["status"],
      {
        name: "idx_hcoord_status",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("horizontal_coordination_requests");
  },
};
