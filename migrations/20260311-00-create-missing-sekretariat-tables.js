// migrations/20260311-00-create-missing-sekretariat-tables.js
// Creates supporting tables: layanan, audit_log, notification_queue
// These tables are prerequisites for the task workflow feature.

export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();

  if (!tables.includes("layanan")) {
    await queryInterface.createTable("layanan", {
      id: {
        type: Sequelize.STRING(64),
        primaryKey: true,
      },
      nama: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      sla_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
  }

  if (!tables.includes("audit_log")) {
    await queryInterface.createTable("audit_log", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      module: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.INTEGER,
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
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addIndex("audit_log", ["module", "entity_id"]);
    await queryInterface.addIndex("audit_log", ["actor_id"]);
  }

  if (!tables.includes("notification_queue")) {
    await queryInterface.createTable("notification_queue", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      channel: {
        type: Sequelize.ENUM("email", "push", "sms", "in_app"),
        allowNull: false,
        defaultValue: "in_app",
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "sent", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sent_at: {
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
    await queryInterface.addIndex("notification_queue", ["recipient_id", "status"]);
  }
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("notification_queue").catch(() => {});
  await queryInterface.dropTable("audit_log").catch(() => {});
  await queryInterface.dropTable("layanan").catch(() => {});
};
