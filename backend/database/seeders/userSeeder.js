module.exports = {
    up: async (queryInterface) => {
      await queryInterface.bulkInsert('Users', [
  {
    "id": 1,
    "email": "super_admin@example.com",
    "password": "password123",
    "role": "super_admin",
    "dashboardUrl": "/dashboard/superadmin"
  },
  {
    "id": 2,
    "email": "gubernur@example.com",
    "password": "password123",
    "role": "gubernur",
    "dashboardUrl": "/dashboard/superadmin"
  },
  {
    "id": 3,
    "email": "sekretaris@example.com",
    "password": "password123",
    "role": "sekretaris",
    "dashboardUrl": "/dashboard/sekretariat"
  },
  {
    "id": 4,
    "email": "kepala_bidang_ketersediaan@example.com",
    "password": "password123",
    "role": "kepala_bidang_ketersediaan",
    "dashboardUrl": "/dashboard/ketersediaan"
  },
  {
    "id": 5,
    "email": "kepala_bidang_distribusi@example.com",
    "password": "password123",
    "role": "kepala_bidang_distribusi",
    "dashboardUrl": "/dashboard/distribusi"
  },
  {
    "id": 6,
    "email": "kepala_bidang_konsumsi@example.com",
    "password": "password123",
    "role": "kepala_bidang_konsumsi",
    "dashboardUrl": "/dashboard/konsumsi"
  },
  {
    "id": 7,
    "email": "kepala_uptd@example.com",
    "password": "password123",
    "role": "kepala_uptd",
    "dashboardUrl": "/dashboard/uptd"
  },
  {
    "id": 8,
    "email": "publik@example.com",
    "password": "password123",
    "role": "publik",
    "dashboardUrl": "/dashboard-publik"
  }
], {});
    },

    down: async (queryInterface) => {
      await queryInterface.bulkDelete('Users', null, {});
    },
  };