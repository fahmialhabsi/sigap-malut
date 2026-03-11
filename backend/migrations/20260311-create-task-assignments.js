export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("TaskAssignments", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Tasks", key: "id" },
      onDelete: "CASCADE",
    },
    assignee_role: { type: Sequelize.STRING, allowNull: false },
    assignee_user_id: { type: Sequelize.INTEGER, allowNull: true },
    assigned_by: { type: Sequelize.INTEGER, allowNull: false },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "assigned",
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("TaskAssignments");
};
