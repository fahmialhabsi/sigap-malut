module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define(
    "TaskAssignment",
    {
      task_id: DataTypes.INTEGER,
      assignee_role: DataTypes.STRING,
      assignee_user_id: DataTypes.INTEGER,
      assigned_by: DataTypes.INTEGER,
      assigned_at: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    { tableName: "TaskAssignments", underscored: true, timestamps: false },
  );

  TaskAssignment.associate = function (models) {
    TaskAssignment.belongsTo(models.Task, { foreignKey: "task_id" });
    if (models.User) {
      TaskAssignment.belongsTo(models.User, {
        foreignKey: "assignee_user_id",
        as: "assignee",
      });
    }
  };

  return TaskAssignment;
};
