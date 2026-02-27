import fs from "fs";
import path from "path";
import { sequelize } from "../config/database.js";
import { initModels } from "../models/index.js";

async function main() {
  await initModels(sequelize);

  // ensure tables exist
  await sequelize.sync();

  const Permission = (await import("../models/permission.js")).default;
  const Role = (await import("../models/role.js")).default;
  const RolePermission = (await import("../models/rolePermission.js")).default;

  const workflowsDir = path.join(process.cwd(), "backend", "workflows");
  const files = fs.readdirSync(workflowsDir).filter((f) => f.endsWith(".json"));

  const found = new Map();

  for (const file of files) {
    const content = JSON.parse(
      fs.readFileSync(path.join(workflowsDir, file), "utf8"),
    );
    const transitions = content.transitions || [];
    for (const t of transitions) {
      const perms = t.requiredPermissions || [];
      for (const p of perms) found.set(p, p);
    }
  }

  const perms = Array.from(found.keys()).sort();

  console.log("Seeding", perms.length, "permissions");

  for (const key of perms) {
    await Permission.findOrCreate({
      where: { key },
      defaults: { description: null },
    });
  }

  // create a super-admin role and assign all permissions
  const [adminRole] = await Role.findOrCreate({
    where: { name: "super_admin" },
    defaults: { description: "Full access" },
  });
  const allPermissions = await Permission.findAll();

  for (const perm of allPermissions) {
    await RolePermission.findOrCreate({
      where: { role_id: adminRole.id, permission_id: perm.id },
    });
  }

  console.log("Seed complete. Permissions:", allPermissions.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
