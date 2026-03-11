export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("task_logs", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "tasks", key: "id" },
      onDelete: "CASCADE",
    },
    actor_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    action: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    from_status: {
      type: Sequelize.STRING(32),
      allowNull: true,
    },
    to_status: {
      type: Sequelize.STRING(32),
      allowNull: true,
    },
    notes: {
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
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("task_logs", ["task_id"]);
  await queryInterface.addIndex("task_logs", ["actor_id"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("task_logs");
};
