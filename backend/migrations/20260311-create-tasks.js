export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("tasks", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    layanan_id: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    assigned_to: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    created_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    status: {
      type: Sequelize.ENUM(
        "open",
        "assigned",
        "accepted",
        "submitted",
        "verified",
        "reviewed",
        "closed",
        "rejected",
      ),
      allowNull: false,
      defaultValue: "open",
    },
    priority: {
      type: Sequelize.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "medium",
    },
    sla_seconds: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    due_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    metadata: {
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

  await queryInterface.addIndex("tasks", ["assigned_to"]);
  await queryInterface.addIndex("tasks", ["status"]);
  await queryInterface.addIndex("tasks", ["layanan_id"]);
  await queryInterface.addIndex("tasks", ["sla_seconds"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("tasks");
};
