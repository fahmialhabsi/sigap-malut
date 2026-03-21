/**
 * Seeder: Apply canonical roles from .dse/patches/role_permission_patch/proposed_roles.json
 * Date: 2026-03-10
 * Purpose: Initialize all roles with their default permissions per ISO governance framework
 */

import { v4 as uuidv4 } from "uuid";

const canonicalRoles = [
  {
    id: uuidv4(),
    code: "kepala_dinas",
    name: "Kepala Dinas",
    level: 1,
    description:
      "Pemegang otoritas tertinggi di Dinas Pangan; memiliki hak approve akhir untuk workflow strategis.",
    default_permissions: [
      "approve:kgb",
      "approve:kepegawaian",
      "finalize:kgb",
      "finalize:kepegawaian",
      "read:compliance_reports",
      "read:audit_log",
      "manage:governance_settings",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "sekretaris",
    name: "Sekretaris",
    level: 2,
    description:
      "Koordinator operasional internal; filter/koordinator alur staf ke Kepala Dinas.",
    default_permissions: [
      "create:kgb",
      "read:kgb",
      "update:kgb",
      "delete:kgb",
      "create:kepegawaian",
      "read:kepegawaian",
      "update:kepegawaian",
      "delete:kepegawaian",
      "approve:staff_level",
      "finalize:administration",
      "manage:administration_records",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "kepala_bidang",
    name: "Kepala Bidang",
    level: 3,
    description:
      "Pemimpin tiap bidang teknis; reviewer dan approver untuk layanan bidang.",
    default_permissions: [
      "create:distribusi",
      "read:distribusi",
      "update:distribusi",
      "delete:distribusi",
      "finalize:distribusi",
      "create:konsumsi",
      "read:konsumsi",
      "update:konsumsi",
      "delete:konsumsi",
      "finalize:konsumsi",
      "approve:field_requests",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "kepala_uptd",
    name: "Kepala UPTD",
    level: 4,
    description: "Penanggung jawab UPTD; dapat approve permintaan UPTD.",
    default_permissions: [
      "create:uptd",
      "read:uptd",
      "update:uptd",
      "delete:uptd",
      "approve:uptd_requests",
      "finalize:uptd",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "atasan",
    name: "Atasan Langsung",
    level: 5,
    description:
      "Peran generik untuk atasan langsung yang mengajukan/menilai tugas bawahan.",
    default_permissions: ["approve:direct_reports", "read:direct_reports"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "staf",
    name: "Staf",
    level: 6,
    description:
      "Pengguna level staf; dapat membuat permohonan dan melihat data sendiri.",
    default_permissions: ["create:kgb_request", "read:own_records", "read:kgb"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "pelaksana",
    name: "Pelaksana",
    level: 7,
    description:
      "Pelaksana teknis di bidang; peran operasional pada workflow stok/komoditas.",
    default_permissions: [
      "create:stok_records",
      "read:stok_records",
      "update:stok_records",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "fungsional",
    name: "Fungsional",
    level: 8,
    description: "Jabatan fungsional teknis untuk analisis dan verifikasi.",
    default_permissions: ["analyze:data", "verify:requests", "read:field_data"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "bendahara",
    name: "Bendahara",
    level: 9,
    description:
      "Bertanggung jawab atas verifikasi pembayaran dan dokumen keuangan.",
    default_permissions: [
      "create:payments",
      "read:financial_records",
      "update:payments",
      "delete:payments",
      "verify:payments",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "data_steward",
    name: "Data Steward",
    level: 10,
    description:
      "Penanggung jawab master-data (SSOT), validasi referensi, mapping dan transformasi.",
    default_permissions: [
      "manage:master_data",
      "approve:master_changes",
      "read:master_data",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "sysadmin",
    name: "System Administrator",
    level: 11,
    description:
      "Operasional teknis: deploy, konfigurasi, integrasi, dan manajemen secrets.",
    default_permissions: [
      "manage:infrastructure",
      "manage:integrations",
      "manage:secrets",
      "read:infrastructure_metrics",
    ],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "auditor",
    name: "Auditor",
    level: 12,
    description:
      "Akses read-only ke audit trail dan laporan compliance untuk kepentingan audit SPIP/SPBE.",
    default_permissions: ["read:audit_log", "read:compliance_reports"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "kepala_subbagian",
    name: "Kepala Subbagian",
    level: 13,
    description:
      "Penanggung jawab subbagian tata usaha/administrasi; reviewer operasional pada level subbagian.",
    default_permissions: ["read:subbag_data", "approve:subbag_requests"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "kepala_seksi",
    name: "Kepala Seksi",
    level: 14,
    description:
      "Penanggung jawab seksi teknis; reviewer/validator untuk kegiatan seksi.",
    default_permissions: ["read:seksi_data", "approve:seksi_requests"],
    is_active: true,
  },
  {
    id: uuidv4(),
    code: "devops",
    name: "DevOps",
    level: 15,
    description:
      "Operasional platform CI/CD dan runbook deployment; terkait pengelolaan infrastruktur aplikasi.",
    default_permissions: [
      "deploy:applications",
      "manage:ci_cd",
      "read:infrastructure_metrics",
    ],
    is_active: true,
  },
];

export async function seedRoles(sequelize) {
  try {
    const Role = sequelize.models.Role;
    if (!Role) {
      console.error("❌ Role model not found");
      return;
    }

    // Check if roles already exist
    const existingRoles = await Role.findAll();
    if (existingRoles.length > 0) {
      console.log(
        `⚠️  Found ${existingRoles.length} existing roles. Skipping bulk insert.`,
      );
      // Update permissions for existing roles if needed
      for (const canonicalRole of canonicalRoles) {
        const existing = await Role.findOne({
          where: { code: canonicalRole.code },
        });
        if (existing) {
          await existing.update({
            default_permissions: canonicalRole.default_permissions,
          });
          console.log(`✅ Updated permissions for role: ${canonicalRole.name}`);
        } else {
          await Role.create(canonicalRole);
          console.log(`✅ Created new role: ${canonicalRole.name}`);
        }
      }
      return;
    }

    // Bulk create if no roles exist
    await Role.bulkCreate(canonicalRoles);
    console.log(
      `✅ Seeded ${canonicalRoles.length} canonical roles with default permissions`,
    );
  } catch (error) {
    console.error("❌ Error seeding roles:", error.message);
    throw error;
  }
}

export default { seedRoles };
