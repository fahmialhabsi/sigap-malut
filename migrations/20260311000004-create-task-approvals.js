export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("task_approvals", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "tasks", key: "id" },
      onDelete: "CASCADE",
    },
    approver_role: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    approver_user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    decision: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    decided_at: {
      type: Sequelize.DATE,
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
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("task_approvals");
};
