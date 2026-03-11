export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("tasks", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    modul_id: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    layanan_id: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "draft",
    },
    priority: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "medium",
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    is_sensitive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  await queryInterface.dropTable("tasks");
};
