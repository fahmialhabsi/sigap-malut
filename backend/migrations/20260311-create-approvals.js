export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("approvals", {
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
    approver_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    approver_role: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    level: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: Sequelize.ENUM("pending", "approved", "rejected", "revised"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
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

  await queryInterface.addIndex("approvals", ["task_id"]);
  await queryInterface.addIndex("approvals", ["approver_id"]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("approvals");
};
