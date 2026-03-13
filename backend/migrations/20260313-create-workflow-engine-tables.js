export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("workflow_instance", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_id: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: Sequelize.STRING(128),
      allowNull: true,
    },
    current_state: {
      type: Sequelize.STRING(64),
      allowNull: false,
      defaultValue: "draft",
    },
    status: {
      type: Sequelize.ENUM("active", "completed", "rejected"),
      allowNull: false,
      defaultValue: "active",
    },
    current_role: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    next_role: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    submitted_by: {
      type: Sequelize.STRING(128),
      allowNull: true,
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    started_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    closed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  await queryInterface.createTable("workflow_history", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workflow_instance_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "workflow_instance",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    module_id: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: Sequelize.STRING(128),
      allowNull: true,
    },
    from_state: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    to_state: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    action: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    actor_id: {
      type: Sequelize.STRING(128),
      allowNull: true,
    },
    actor_role: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    payload: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  await queryInterface.addIndex(
    "workflow_instance",
    ["module_id", "entity_id"],
    {
      name: "idx_workflow_instance_module_entity",
    },
  );

  await queryInterface.addIndex(
    "workflow_history",
    ["workflow_instance_id", "created_at"],
    {
      name: "idx_workflow_history_instance_created",
    },
  );
};

export const down = async (queryInterface) => {
  await queryInterface
    .removeIndex("workflow_history", "idx_workflow_history_instance_created")
    .catch(() => {});
  await queryInterface
    .removeIndex("workflow_instance", "idx_workflow_instance_module_entity")
    .catch(() => {});
  await queryInterface.dropTable("workflow_history");
  await queryInterface.dropTable("workflow_instance");
};
