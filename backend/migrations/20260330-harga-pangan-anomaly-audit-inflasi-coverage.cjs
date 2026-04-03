"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
  const qi = queryInterface;
  const t = "harga_pangan";

  const cols = await qi.describeTable(t).catch(() => ({}));
  if (!cols.is_anomaly) {
    await qi.addColumn(t, "is_anomaly", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }
  if (!cols.anomaly_reason) {
    await qi.addColumn(t, "anomaly_reason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }

  try {
    await qi.addIndex(t, ["is_anomaly", "status"], {
      name: "harga_pangan_is_anomaly_status",
    });
  } catch (e) {
    if (!/already exists|duplicate/i.test(String(e.message))) throw e;
  }

  const inflasiCols = await qi.describeTable("inflasi_harian").catch(() => ({}));
  if (inflasiCols && Object.keys(inflasiCols).length && !inflasiCols.coverage_komoditas_persen) {
    await qi.addColumn("inflasi_harian", "coverage_komoditas_persen", {
      type: Sequelize.DECIMAL(6, 2),
      allowNull: true,
    });
  }

  try {
    await qi.createTable("harga_pangan_logs", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      harga_pangan_id: { type: Sequelize.INTEGER, allowNull: true },
      batch_id: { type: Sequelize.UUID, allowNull: true },
      aksi: { type: Sequelize.STRING(32), allowNull: false },
      old_value: { type: Sequelize.JSON, allowNull: true },
      new_value: { type: Sequelize.JSON, allowNull: true },
      actor_id: { type: Sequelize.INTEGER, allowNull: false },
      actor_role: { type: Sequelize.STRING(128), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    await qi.addIndex("harga_pangan_logs", ["batch_id"]);
    await qi.addIndex("harga_pangan_logs", ["harga_pangan_id"]);
    await qi.addIndex("harga_pangan_logs", ["created_at"]);
  } catch (e) {
    if (!/already exists|duplicate/i.test(String(e.message))) throw e;
  }

  },

  async down(queryInterface, Sequelize) {
  const qi = queryInterface;
  await qi.dropTable("harga_pangan_logs").catch(() => {});
  await qi.removeIndex("harga_pangan", "harga_pangan_is_anomaly_status").catch(() => {});
  const inflasiCols = await qi.describeTable("inflasi_harian").catch(() => ({}));
  if (inflasiCols?.coverage_komoditas_persen) {
    await qi.removeColumn("inflasi_harian", "coverage_komoditas_persen");
  }
  const cols = await qi.describeTable("harga_pangan").catch(() => ({}));
  if (cols?.anomaly_reason) await qi.removeColumn("harga_pangan", "anomaly_reason");
  if (cols?.is_anomaly) await qi.removeColumn("harga_pangan", "is_anomaly");

  },
};
