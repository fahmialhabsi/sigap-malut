export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("task_assignments", {
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
    assigned_to: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
    assigned_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    role: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

  await queryInterface.addIndex("task_assignments", ["task_id"]);
  await queryInterface.addIndex("task_assignments", ["assigned_to"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("task_assignments");
};
