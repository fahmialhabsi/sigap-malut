export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn("users", "dashboardUrl", {
    type: Sequelize.STRING,
    allowNull: true,
  });
};

export const down = async (queryInterface) => {
  await queryInterface.removeColumn("users", "dashboardUrl");
};
