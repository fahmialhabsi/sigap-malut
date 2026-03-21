"use strict";

const TABLE_NAME = "data_induk_asn";
const ENUM_IS_SENSITIVE = "enum_data_induk_asn_is_sensitive";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // nip (18 chars)
    await queryInterface.addColumn(TABLE_NAME, "nip", {
      type: Sequelize.STRING(18),
      allowNull: true,
    });

    // email
    await queryInterface.addColumn(TABLE_NAME, "email", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // phone
    await queryInterface.addColumn(TABLE_NAME, "phone", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    // is_sensitive (enum)
    await queryInterface.addColumn(TABLE_NAME, "is_sensitive", {
      type: Sequelize.ENUM("Biasa", "Sensitif"),
      allowNull: false,
      defaultValue: "Biasa",
    });

    // created_by (FK -> users.id)
    await queryInterface.addColumn(TABLE_NAME, "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // safer: create partial unique index on nip for Postgres (ignore NULLs)
    if (
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === "postgres"
    ) {
      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS ${TABLE_NAME}_nip_unique ON ${TABLE_NAME} (nip) WHERE nip IS NOT NULL;`,
      );
    } else {
      // fallback for sqlite/mysql: create normal unique index (may fail if duplicates exist)
      await queryInterface.addIndex(TABLE_NAME, ["nip"], {
        unique: true,
        name: `${TABLE_NAME}_nip_unique`,
      });
    }

    // Add FK constraint to users.id (created_by)
    await queryInterface.addConstraint(TABLE_NAME, {
      fields: ["created_by"],
      type: "foreign key",
      name: `${TABLE_NAME}_created_by_fkey`,
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // remove FK constraint
    try {
      await queryInterface.removeConstraint(
        TABLE_NAME,
        `${TABLE_NAME}_created_by_fkey`,
      );
    } catch (e) {}

    // remove index safely
    try {
      if (
        queryInterface.sequelize.getDialect &&
        queryInterface.sequelize.getDialect() === "postgres"
      ) {
        await queryInterface.sequelize.query(
          `DROP INDEX IF EXISTS ${TABLE_NAME}_nip_unique;`,
        );
      } else {
        await queryInterface.removeIndex(
          TABLE_NAME,
          `${TABLE_NAME}_nip_unique`,
        );
      }
    } catch (e) {}

    await queryInterface.removeColumn(TABLE_NAME, "created_by");
    await queryInterface.removeColumn(TABLE_NAME, "is_sensitive");
    await queryInterface.removeColumn(TABLE_NAME, "phone");
    await queryInterface.removeColumn(TABLE_NAME, "email");
    await queryInterface.removeColumn(TABLE_NAME, "nip");

    // cleanup enum type on Postgres
    if (
      queryInterface.sequelize.getDialect &&
      queryInterface.sequelize.getDialect() === "postgres"
    ) {
      await queryInterface.sequelize.query(
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${ENUM_IS_SENSITIVE}') THEN DROP TYPE "${ENUM_IS_SENSITIVE}"; END IF; END$$;`,
      );
    }
  },
};
