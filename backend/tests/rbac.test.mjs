import { expect } from "chai";
import request from "supertest";
import jwt from "jsonwebtoken";
import { sequelize } from "../config/database.js";
import { initModels } from "../models/index.js";
import { app } from "../server.js";

const SECRET = process.env.JWT_SECRET || "dev-secret";

describe("RBAC endpoints", function () {
  this.timeout(10000);

  before(async () => {
    await initModels(sequelize);
    await sequelize.sync({ force: true });

    // seed a permission for testing
    const Permission = (await import("../models/permission.js")).default;
    await Permission.create({ key: "test.permission", description: "Test" });
  });

  it("GET /api/rbac/permissions should return paginated list with auth", async () => {
    const token = jwt.sign(
      { id: 1, roles: ["super_admin"], permissions: [] },
      SECRET,
    );
    const res = await request(app)
      .get("/api/rbac/permissions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.be.an("array");
  });

  it("create role and assign permission", async () => {
    const token = jwt.sign(
      { id: 1, roles: ["super_admin"], permissions: [] },
      SECRET,
    );
    // create role
    const r = await request(app)
      .post("/api/rbac/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "test-role", description: "for tests" });
    expect(r.status).to.equal(201);
    const roleId = r.body.data.id;

    // get permission id
    const perms = await request(app)
      .get("/api/rbac/permissions")
      .set("Authorization", `Bearer ${token}`);
    const pid = perms.body.data.find((p) => p.key === "test.permission").id;

    // assign
    const a = await request(app)
      .post(`/api/rbac/roles/${roleId}/permissions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ permissionIds: [pid] });
    expect(a.status).to.equal(200);

    // get role detail
    const det = await request(app)
      .get(`/api/rbac/roles/${roleId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(det.status).to.equal(200);
    expect(det.body.data.permissions.some((p) => p.id === pid)).to.be.true;
  });
});
