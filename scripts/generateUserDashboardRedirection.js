const fs = require("fs");
const path = require("path");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../backend/config/database.js");
const User = require("../backend/models/User.js").default;

const roleDashboardMapping = {
  super_admin: "/dashboard/superadmin",
  gubernur: "/dashboard/superadmin",
  sekretaris: "/dashboard/sekretariat",
  kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
  kepala_bidang_distribusi: "/dashboard/distribusi",
  kepala_bidang_konsumsi: "/dashboard/konsumsi",
  kepala_uptd: "/dashboard/uptd",
  publik: "/dashboard-publik",
};

(async () => {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    console.log("Fetching users...");
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "role_id",
        "unit_id",
        "unit_kerja",
        "is_active",
      ],
      where: {
        is_active: true,
      },
      paranoid: false,
    });
    console.log("Fetched users:", JSON.stringify(users, null, 2));

    const userDashboardMappings = users.map((user) => {
      const dashboardUrl =
        roleDashboardMapping[user.role_id || user.role] || "/dashboard/default";
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        dashboardUrl,
      };
    });

    console.log("User Dashboard Mappings:", userDashboardMappings);
  } catch (error) {
    console.error("Error:", error);
  }
})();
