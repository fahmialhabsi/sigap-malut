export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("task_logs", {
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
    actor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    action: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    data_old: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    data_new: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("task_logs");
};
