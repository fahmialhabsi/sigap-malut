module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      modul_id: DataTypes.STRING,
      layanan_id: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      status: DataTypes.STRING,
      priority: DataTypes.STRING,
      due_date: DataTypes.DATE,
      is_sensitive: DataTypes.BOOLEAN,
    },
    { tableName: "Tasks", underscored: true, timestamps: false },
  );

  Task.associate = function (models) {
    Task.hasMany(models.TaskAssignment, { foreignKey: "task_id" });
    Task.hasMany(models.TaskLog, { foreignKey: "task_id" });
    Task.hasMany(models.Approval, { foreignKey: "task_id" });
    // If Users model exists:
    if (models.User) {
      Task.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
    }
  };

  return Task;
};
