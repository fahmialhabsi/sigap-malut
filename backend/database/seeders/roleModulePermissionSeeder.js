import sequelize from "../../config/database.js";

const PILOT_MODULES = {
  "sek-adm": {
    ownerRoles: ["sekretaris", "kasubag_umum_kepegawaian", "staf_pelaksana"],
  },
  "sek-keu": {
    ownerRoles: ["sekretaris", "bendahara", "staf_pelaksana"],
  },
  "bkt-kbj": {
    ownerRoles: [
      "kepala_bidang_ketersediaan",
      "pejabat_fungsional",
      "staf_pelaksana",
    ],
  },
  "bds-hrg": {
    ownerRoles: [
      "kepala_bidang_distribusi",
      "pejabat_fungsional",
      "staf_pelaksana",
    ],
  },
  "bks-dvr": {
    ownerRoles: [
      "kepala_bidang_konsumsi",
      "pejabat_fungsional",
      "staf_pelaksana",
    ],
  },
};

const OWNER_PERMISSIONS = ["read", "create", "update", "delete", "submit"];
const REVIEWER_PERMISSIONS = ["read", "approve"];
const REVIEWER_ROLES = ["sekretaris", "kepala_dinas", "super_admin"];

function buildEntries() {
  const entries = [];

  for (const [moduleKey, meta] of Object.entries(PILOT_MODULES)) {
    for (const roleCode of meta.ownerRoles) {
      for (const permission of OWNER_PERMISSIONS) {
        entries.push({ roleCode, moduleKey, permission, isActive: true });
      }
    }

    for (const roleCode of REVIEWER_ROLES) {
      for (const permission of REVIEWER_PERMISSIONS) {
        entries.push({ roleCode, moduleKey, permission, isActive: true });
      }
    }
  }

  return entries;
}

export async function seedRoleModulePermissions() {
  console.log("🛡️  Seeding pilot role_module_permissions...\n");

  const entries = buildEntries();
  const dialect = sequelize.getDialect();
  let successCount = 0;

  for (const entry of entries) {
    const { roleCode, moduleKey, permission, isActive } = entry;

    if (dialect === "postgres") {
      await sequelize.query(
        `INSERT INTO role_module_permissions
          (role_code, module_key, permission, is_active, created_at, updated_at)
         VALUES (:roleCode, :moduleKey, :permission, :isActive, now(), now())
         ON CONFLICT (role_code, module_key, permission)
         DO UPDATE SET is_active = EXCLUDED.is_active, updated_at = now()`,
        {
          replacements: {
            roleCode,
            moduleKey,
            permission,
            isActive,
          },
        },
      );
    } else {
      await sequelize.query(
        `INSERT OR REPLACE INTO role_module_permissions
          (id, role_code, module_key, permission, is_active, created_at, updated_at)
         VALUES (
           (SELECT id FROM role_module_permissions WHERE role_code = ? AND module_key = ? AND permission = ?),
           ?, ?, ?, ?, datetime('now'), datetime('now')
         )`,
        {
          replacements: [
            roleCode,
            moduleKey,
            permission,
            roleCode,
            moduleKey,
            permission,
            isActive ? 1 : 0,
          ],
        },
      );
    }

    successCount += 1;
  }

  console.log(
    `  ✅ ${successCount} role_module_permissions entries upserted\n`,
  );
}

export default { seedRoleModulePermissions };
