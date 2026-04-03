"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable("TaskFiles", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Tasks", key: "id" },
      onDelete: "CASCADE",
    },
    file_name: { type: Sequelize.STRING(255), allowNull: false },
    file_path: { type: Sequelize.STRING(500), allowNull: false },
    file_type: { type: Sequelize.STRING(100), allowNull: true },
    file_size: { type: Sequelize.INTEGER, allowNull: true },
    uploaded_by: { type: Sequelize.INTEGER, allowNull: false },
    file_hash: { type: Sequelize.STRING(64), allowNull: true }, // SHA-256 for integrity
    uploaded_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  },

  async down(queryInterface) {
  await queryInterface.dropTable("TaskFiles");

  },
};
