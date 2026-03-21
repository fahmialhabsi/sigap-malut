"use strict";

const TABLE_NAME = "penghargaan";
const ENUM_IS_SENSITIVE = "enum_penghargaan_is_sensitive";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME, {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      asn_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      nip: {
        type: Sequelize.STRING(18),
        allowNull: true,
      },
      nama_asn: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      jenis_penghargaan: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tanggal_penghargaan: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      nomor_sk: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      penanggung_jawab: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_sensitive: {
        type: Sequelize.ENUM("Biasa", "Sensitif"),
        allowNull: false,
        defaultValue: "Biasa",
      },
      created_by: {
        type: Sequelize.INTEGER,
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

    // FK: created_by -> users.id
    await queryInterface.addConstraint(TABLE_NAME, {
      fields: ["created_by"],
      type: "foreign key",
      name: `${TABLE_NAME}_created_by_fkey`,
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Optional FK asn_id -> asns.id (if asns table exists as integer PK)
    try {
      await queryInterface.addConstraint(TABLE_NAME, {
        fields: ["asn_id"],
        type: "foreign key",
        name: `${TABLE_NAME}_asn_id_fkey`,
        references: { table: "asns", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    } catch (e) {
      // ignore if asns table has different PK type; you can add FK later if needed
    }
  },

  down: async (queryInterface, Sequelize) => {
    // remove constraints if exist
    try {
      await queryInterface.removeConstraint(
        TABLE_NAME,
        `${TABLE_NAME}_created_by_fkey`,
      );
    } catch (e) {}
    try {
      await queryInterface.removeConstraint(
        TABLE_NAME,
        `${TABLE_NAME}_asn_id_fkey`,
      );
    } catch (e) {}

    await queryInterface.dropTable(TABLE_NAME);

    // cleanup enum types on Postgres
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
