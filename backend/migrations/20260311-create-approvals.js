export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("Approvals", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Tasks", key: "id" },
      onDelete: "CASCADE",
    },
    approver_role: { type: Sequelize.STRING, allowNull: false },
    approver_user_id: { type: Sequelize.INTEGER, allowNull: true },
    decision: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    note: { type: Sequelize.TEXT, allowNull: true },
    decided_at: { type: Sequelize.DATE, allowNull: true },
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("Approvals");
};
