module.exports = (sequelize, DataTypes) => {
  const TaskLog = sequelize.define(
    "TaskLog",
    {
      task_id: DataTypes.INTEGER,
      actor_id: DataTypes.INTEGER,
      action: DataTypes.STRING,
      note: DataTypes.TEXT,
      data_old: DataTypes.JSON,
      data_new: DataTypes.JSON,
      created_at: DataTypes.DATE,
    },
    { tableName: "TaskLogs", underscored: true, timestamps: false },
  );

  TaskLog.associate = function (models) {
    TaskLog.belongsTo(models.Task, { foreignKey: "task_id" });
  };

  return TaskLog;
};
