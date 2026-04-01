export const up = async (queryInterface, Sequelize) => {
  // 1) user_hierarchy (relasi struktural atasan-bawahan)
  const tables = await queryInterface
    .showAllTables()
    .then((t) => t.map((x) => String(x).toLowerCase()))
    .catch(() => []);
  const hasUserHierarchy = tables.includes("user_hierarchy");
  if (!hasUserHierarchy) {
    await queryInterface.createTable("user_hierarchy", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      atasan_id: { type: Sequelize.INTEGER, allowNull: false },
      bawahan_id: { type: Sequelize.INTEGER, allowNull: false },
      adalah_primer: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      catatan: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await queryInterface.addConstraint("user_hierarchy", {
      fields: ["atasan_id", "bawahan_id"],
      type: "unique",
      name: "unique_atasan_bawahan_user_hierarchy",
    });
  }

  // 2) Task return fields used by dikembalikan workflow
  const desc = await queryInterface.describeTable("Tasks");

  const addIfMissing = async (columnName, definition) => {
    if (!desc[columnName]) {
      await queryInterface.addColumn("Tasks", columnName, definition);
    }
  };

  await addIfMissing("returned_by", { type: Sequelize.INTEGER, allowNull: true });
  await addIfMissing("returned_at", { type: Sequelize.DATE, allowNull: true });
  await addIfMissing("catatan_verifikasi", { type: Sequelize.TEXT, allowNull: true });
  await addIfMissing("revisi_ke", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("user_hierarchy").catch(() => {});
  await queryInterface.removeColumn("Tasks", "returned_by").catch(() => {});
  await queryInterface.removeColumn("Tasks", "returned_at").catch(() => {});
  await queryInterface.removeColumn("Tasks", "catatan_verifikasi").catch(() => {});
  await queryInterface.removeColumn("Tasks", "revisi_ke").catch(() => {});
};

