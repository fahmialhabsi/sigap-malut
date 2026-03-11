module.exports = (sequelize, DataTypes) => {
  const Approval = sequelize.define(
    "Approval",
    {
      task_id: DataTypes.INTEGER,
      approver_role: DataTypes.STRING,
      approver_user_id: DataTypes.INTEGER,
      decision: DataTypes.STRING,
      note: DataTypes.TEXT,
      decided_at: DataTypes.DATE,
    },
    { tableName: "Approvals", underscored: true, timestamps: false },
  );

  Approval.associate = function (models) {
    Approval.belongsTo(models.Task, { foreignKey: "task_id" });
  };

  return Approval;
};
