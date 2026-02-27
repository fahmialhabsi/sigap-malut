import request from "supertest";
import jwt from "jsonwebtoken";
import { sequelize } from "../config/database.js";
import { initModels } from "../models/index.js";
import { app } from "../server.js";

const SECRET = process.env.JWT_SECRET || "dev-secret";

async function main() {
  try {
    console.log("Init DB...");
    await initModels(sequelize);
    await sequelize.sync({ force: true });
    const Permission = (await import("../models/permission.js")).default;
    await Permission.create({ key: "test.permission", description: "Test" });

    const token = jwt.sign(
      { id: 1, roles: ["super_admin"], permissions: [] },
      SECRET,
    );

    console.log("Checking GET /api/rbac/permissions");
    let res = await request(app)
      .get("/api/rbac/permissions")
      .set("Authorization", `Bearer ${token}`);
    if (res.status !== 200)
      throw new Error("permissions list failed " + res.status);
    console.log("permissions count", res.body.data.length);

    console.log("Creating role");
    res = await request(app)
      .post("/api/rbac/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "smoke-role", description: "smoke" });
    if (res.status !== 201) throw new Error("create role failed " + res.status);
    const roleId = res.body.data.id;

    const perms = await request(app)
      .get("/api/rbac/permissions")
      .set("Authorization", `Bearer ${token}`);
    const pid = perms.body.data.find((p) => p.key === "test.permission").id;

    console.log("Assigning permission", pid, "to role", roleId);
    res = await request(app)
      .post(`/api/rbac/roles/${roleId}/permissions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ permissionIds: [pid] });
    if (res.status !== 200) throw new Error("assign failed " + res.status);

    console.log("Fetching role detail");
    res = await request(app)
      .get(`/api/rbac/roles/${roleId}`)
      .set("Authorization", `Bearer ${token}`);
    if (res.status !== 200) throw new Error("get role failed " + res.status);
    if (!res.body.data.permissions.some((p) => p.id === pid))
      throw new Error("permission not assigned");

    console.log("SMOKE OK");
    process.exit(0);
  } catch (e) {
    console.error("SMOKE FAILED", e);
    process.exit(1);
  }
}

main();
