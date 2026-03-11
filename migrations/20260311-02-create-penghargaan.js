// migrations/20260311-02-create-penghargaan.js
// Creates the penghargaan (awards/recognition) table for sekretariat module.

export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();

  if (!tables.includes("penghargaan")) {
    await queryInterface.createTable("penghargaan", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      pegawai_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
      },
      jenis: {
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      nama_penghargaan: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      instansi_pemberi: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      dokumen_url: {
        type: Sequelize.STRING(512),
        allowNull: true,
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

    await queryInterface.addIndex("penghargaan", ["pegawai_id"]);
  }
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("penghargaan").catch(() => {});
};
