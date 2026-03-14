dotenv.config({ path: path.resolve("backend/.env") });

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

import { sequelize } from "../config/database.js";
import RoleModulePermission from "../models/RoleModulePermission.js";

console.log("[DEBUG] DB_DIALECT:", sequelize.getDialect());

const moduleKeys = [
  "SEK-ADM",
  "SEK-AST",
  "SEK-HUM",
  "SEK-KBJ",
  "SEK-KEP",
  "SEK-KEU",
  "SEK-LDS",
  "SEK-LKS",
  "SEK-LKT",
  "SEK-LUP",
  "SEK-REN",
  "SEK-RMH",
  "BKT-BMB",
  "BKT-FSL",
  "BKT-KBJ",
  "BKT-KRW",
  "BKT-MEV",
  "BKT-PGD",
  "BDS-BMB",
  "BDS-CPD",
  "BDS-EVL",
  "BDS-HRG",
  "BDS-KBJ",
  "BDS-LAP",
  "BDS-MON",
  "BKS-BMB",
  "BKS-DVR",
  "BKS-EVL",
  "BKS-KBJ",
  "BKS-KMN",
  "BKS-LAP",
  "UPT-ADM",
  "UPT-AST",
  "UPT-INS",
  "UPT-KEP",
  "UPT-KEU",
  "UPT-MTU",
  "UPT-TKN",
];

const roles = [
  "operator",
  "verifikator",
  "kepala_bidang",
  "sekretaris",
  "kepala_dinas",
  "admin",
];

const permissions = [
  "read",
  "create",
  "update",
  "delete",
  "submit",
  "verify",
  "approve",
];

async function main() {
  await sequelize.authenticate();

  console.log("DB DIALECT:", sequelize.getDialect());
  console.log("DB DATABASE:", sequelize.config.database);

  console.log("ENV DB_DIALECT:", process.env.DB_DIALECT);
  console.log("ENV DB_HOST:", process.env.DB_HOST);
  console.log("ENV DB_NAME:", process.env.DB_NAME);

  const records = [];
  for (const module_key of moduleKeys) {
    for (const role_code of roles) {
      for (const permission of permissions) {
        records.push({ role_code, module_key, permission });
      }
    }
  }

  // Cek existing
  const existing = await RoleModulePermission.findAll({
    attributes: ["role_code", "module_key", "permission"],
    raw: true,
  });
  const existingSet = new Set(
    existing.map((r) => `${r.role_code}|${r.module_key}|${r.permission}`),
  );

  const toInsert = records.filter(
    (r) => !existingSet.has(`${r.role_code}|${r.module_key}|${r.permission}`),
  );

  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await RoleModulePermission.bulkCreate(toInsert, {
      ignoreDuplicates: true,
    });
    inserted = result.length;
  }

  const total = await RoleModulePermission.count();

  console.log("SIGAP RBAC DATABASE INSERT REPORT");
  console.log("records inserted:", inserted);
  console.log("records skipped:", records.length - inserted);
  console.log("total RBAC records:", total);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
