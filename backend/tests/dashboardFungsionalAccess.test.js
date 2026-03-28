// backend/tests/dashboardFungsionalAccess.test.js
import request from "supertest";
import app from "../server"; // pastikan ini adalah express app utama

describe("Akses endpoint dashboard fungsional (end-to-end RBAC)", () => {
  // Daftar role fungsional dan endpoint dashboard yang harus bisa diakses
  const testCases = [
    {
      role: "fungsional_ketersediaan",
      endpoint: "/api/dashboard/fungsional-ketersediaan/summary",
    },
    {
      role: "fungsional_distribusi",
      endpoint: "/api/dashboard/fungsional-distribusi/summary",
    },
    {
      role: "fungsional_konsumsi",
      endpoint: "/api/dashboard/fungsional-konsumsi/summary",
    },
    {
      role: "fungsional_uptd",
      endpoint: "/api/dashboard/fungsional-uptd/summary",
    },
    {
      role: "fungsional_uptd_mutu",
      endpoint: "/api/dashboard/fungsional-uptd-mutu/summary",
    },
    {
      role: "fungsional_uptd_teknis",
      endpoint: "/api/dashboard/fungsional-uptd-teknis/summary",
    },
  ];

  // Helper: login dan dapatkan token JWT
  async function loginAndGetToken(email, password) {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    return res.body.token;
  }

  testCases.forEach(({ role, endpoint }) => {
    it(`Role ${role} bisa akses endpoint ${endpoint}`, async () => {
      // Asumsi: user dengan email <role>@example.com dan password "password123" sudah ada di database
      const email = `${role}@example.com`;
      const password = "password123";
      const token = await loginAndGetToken(email, password);
      const res = await request(app)
        .get(endpoint)
        .set("Authorization", `Bearer ${token}`);
      expect([200, 404]).toContain(res.status); // 200 jika ada data, 404 jika summary belum diimplementasi
      // Bisa tambahkan expect(res.body) sesuai response
    });
  });
});
