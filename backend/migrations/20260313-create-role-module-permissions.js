export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("role_module_permissions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_code: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    module_key: {
      type: Sequelize.STRING(120),
      allowNull: false,
      defaultValue: "*",
    },
    permission: {
      type: Sequelize.STRING(120),
      allowNull: false,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  await queryInterface.addIndex(
    "role_module_permissions",
    ["role_code", "module_key", "permission"],
    {
      name: "idx_rmp_role_module_perm",
      unique: true,
    },
  );
};

export const down = async (queryInterface) => {
  await queryInterface
    .removeIndex("role_module_permissions", "idx_rmp_role_module_perm")
    .catch(() => {});
  await queryInterface.dropTable("role_module_permissions");
};
