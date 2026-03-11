export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("task_assignments", {
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
    assignee_role: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    assignee_user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    assigned_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "pending",
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
  await queryInterface.dropTable("task_assignments");
};
