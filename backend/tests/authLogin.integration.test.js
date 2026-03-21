import express from "express";
import request from "supertest";
import { expect } from "chai";
import { randomUUID } from "crypto";
import sequelize from "../config/database.js";
import authRoutes from "../routes/auth.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { hashPassword } from "../config/auth.js";

function buildAuthApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
}

async function createLoginFixture() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const roleId = randomUUID();
  const email = `auth-login-${suffix}@example.com`;
  const password = "AuthTest123";
  const roleName = `AUTH_LOGIN_TEST_ROLE_${suffix.replace(/[^a-zA-Z0-9]/g, "")}`;
  const maxLevel = await Role.max("level");
  const roleLevel = Number.isFinite(maxLevel) ? maxLevel + 1 : 90000;

  await Role.create({
    id: roleId,
    name: roleName,
    code: `kepala_dinas_${suffix}`,
    level: roleLevel,
    description: "Temporary role for auth login integration test",
    is_active: true,
  });

  const user = await User.create({
    username: `authlogin_${suffix}`,
    email,
    password: await hashPassword(password),
    plain_password: password,
    name: "Auth Login Test",
    nama_lengkap: "Auth Login Test",
    role: "auth_login_test_role",
    role_id: roleId,
    unit_kerja: "Dinas Pangan Provinsi Maluku Utara",
    unit_id: "DINPANGAN",
    jabatan: "Kepala Dinas",
    is_active: true,
    failed_login_attempts: 2,
  });

  return {
    roleId,
    roleName,
    email,
    password,
    userId: user.id,
  };
}

async function destroyLoginFixture({ email, roleId }) {
  await User.destroy({ where: { email } });
  await Role.destroy({ where: { id: roleId } });
}

describe("Auth Login Integration", () => {
  const app = buildAuthApp();

  before(async function () {
    this.timeout(30000);
    await sequelize.authenticate();
    await sequelize.sync();
  });

  it("should login seeded user and persist auth-related fields with current users schema", async () => {
    const fixture = await createLoginFixture();

    try {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: fixture.email, password: fixture.password });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Login berhasil");
      expect(response.body.data).to.be.an("object");
      expect(response.body.data.token).to.be.a("string").and.not.empty;
      expect(response.body.data.refreshToken).to.be.a("string").and.not.empty;
      expect(response.body.data.dashboardUrl).to.equal("/dashboard");
      expect(response.body.data.roleName).to.equal(fixture.roleName);
      expect(response.body.data.user).to.include({
        id: fixture.userId,
        email: fixture.email,
        role_id: fixture.roleId,
        unit_id: "DINPANGAN",
      });

      const reloadedUser = await User.findByPk(fixture.userId);
      expect(reloadedUser).to.not.equal(null);
      expect(reloadedUser.failed_login_attempts).to.equal(0);
      expect(reloadedUser.locked_until).to.equal(null);
      expect(reloadedUser.last_login).to.not.equal(null);
    } finally {
      await destroyLoginFixture(fixture);
    }
  });
});
