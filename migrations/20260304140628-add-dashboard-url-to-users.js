export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn("Users", "dashboardUrl", {
    type: Sequelize.STRING,
    allowNull: true,
  });
};

export const down = async (queryInterface) => {
  await queryInterface.removeColumn("Users", "dashboardUrl");
};
