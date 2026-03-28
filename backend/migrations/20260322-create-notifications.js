export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("Notifications", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    target_user_id: { type: Sequelize.INTEGER, allowNull: false },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Tasks", key: "id" },
      onDelete: "SET NULL",
    },
    channel: {
      type: Sequelize.ENUM("in_app", "email", "wa"),
      allowNull: false,
      defaultValue: "in_app",
    },
    message: { type: Sequelize.TEXT, allowNull: false },
    link: { type: Sequelize.STRING(500), allowNull: true }, // frontend URL to navigate to
    seen: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("Notifications", ["target_user_id", "seen"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("Notifications");
};
