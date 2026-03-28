/**
 * seedAll.js — Seed roles + users ke SQLite dev database
 * Jalankan: node scripts/seedAll.js
 */
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../config/database.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

await sequelize.authenticate();
console.log("✅ DB connected\n");

// ── 1. Seed Roles ─────────────────────────────────────────────────────────────

const roles = [
  { code: "gubernur",                 name: "Gubernur",                      level: 0  },
  { code: "super_admin",              name: "Super Admin",                   level: 1  },
  { code: "kepala_dinas",             name: "Kepala Dinas",                  level: 2  },
  { code: "sekretaris",               name: "Sekretaris",                    level: 3  },
  { code: "kepala_bidang",            name: "Kepala Bidang",                 level: 4  },
  { code: "kepala_bidang_ketersediaan", name: "Kepala Bidang Ketersediaan", level: 41 },
  { code: "kepala_bidang_distribusi", name: "Kepala Bidang Distribusi",      level: 42 },
  { code: "kepala_bidang_konsumsi",   name: "Kepala Bidang Konsumsi",        level: 43 },
  { code: "kepala_uptd",              name: "Kepala UPTD",                   level: 5  },
  { code: "kasubag",                  name: "Kasubag Umum & Kepegawaian",    level: 6  },
  { code: "kasubag_uptd",             name: "Kasubag UPTD",                  level: 61 },
  { code: "kasi_uptd",                name: "Kepala Seksi UPTD",             level: 62 },
  { code: "fungsional",               name: "Pejabat Fungsional",            level: 7  },
  { code: "fungsional_ketersediaan",  name: "Fungsional Ketersediaan",       level: 71 },
  { code: "fungsional_distribusi",    name: "Fungsional Distribusi",         level: 72 },
  { code: "fungsional_konsumsi",      name: "Fungsional Konsumsi",           level: 73 },
  { code: "fungsional_perencana",     name: "Fungsional Perencana",          level: 74 },
  { code: "fungsional_keuangan",      name: "Fungsional Keuangan",           level: 75 },
  { code: "fungsional_uptd",          name: "Fungsional UPTD",               level: 76 },
  { code: "bendahara",                name: "Bendahara",                     level: 8  },
  { code: "pelaksana",                name: "Pelaksana",                     level: 9  },
  { code: "staf_pelaksana",           name: "Staf Pelaksana",                level: 91 },
  { code: "viewer",                   name: "Viewer / Publik",               level: 99 },
];

const roleMap = {}; // code → id

// Ambil semua level yang sudah terpakai agar tidak konflik
const existingRoles = await Role.findAll({ attributes: ["id", "code", "level"] });
const usedLevels = new Set(existingRoles.map((r) => r.level));
existingRoles.forEach((r) => { if (r.code) roleMap[r.code] = r.id; });

// Gunakan level offset besar untuk menghindari konflik dengan data existing
let levelOffset = 1000;
const getUniqueLevel = (preferred) => {
  if (!usedLevels.has(preferred)) { usedLevels.add(preferred); return preferred; }
  while (usedLevels.has(levelOffset)) levelOffset++;
  const l = levelOffset++;
  usedLevels.add(l);
  return l;
};

for (const r of roles) {
  if (roleMap[r.code]) {
    console.log(`  ⏭  Role exists: ${r.code} (id: ${roleMap[r.code]})`);
    continue;
  }
  try {
    const created = await Role.create({
      id: uuidv4(),
      code: r.code,
      name: r.name,
      level: getUniqueLevel(r.level),
      description: r.name,
      is_active: true,
      default_permissions: [],
    });
    roleMap[r.code] = created.id;
    console.log(`  ✅ Created role: ${r.code}`);
  } catch (err) {
    console.warn(`  ⚠  Skip role ${r.code}: ${err.message}`);
  }
}

// ── 2. Seed Users ─────────────────────────────────────────────────────────────

const PASS = "Admin@123";
const hash = await bcrypt.hash(PASS, 10);

const users = [
  { username: "superadmin",         email: "superadmin@dinpangan.go.id", role_code: "super_admin",              nama_lengkap: "Super Administrator",         unit_kerja: "Dinas Pangan",                jabatan: "Super Admin" },
  { username: "gubernur",           email: "gubernur@malutprov.go.id",   role_code: "gubernur",                 nama_lengkap: "Gubernur Maluku Utara",        unit_kerja: "Pemerintah Provinsi Maluku Utara", jabatan: "Gubernur" },
  { username: "kepala_dinas",       email: "kadis@dinpangan.go.id",      role_code: "kepala_dinas",             nama_lengkap: "Kepala Dinas Pangan",          unit_kerja: "Dinas Pangan",                jabatan: "Kepala Dinas" },
  { username: "sekretaris",         email: "sekretaris@dinpangan.go.id", role_code: "sekretaris",               nama_lengkap: "Sekretaris Dinas",             unit_kerja: "Sekretariat",                 jabatan: "Sekretaris" },
  { username: "kabid_ketersediaan", email: "kabid.kt@dinpangan.go.id",   role_code: "kepala_bidang_ketersediaan", nama_lengkap: "Kepala Bidang Ketersediaan", unit_kerja: "Bidang Ketersediaan",         jabatan: "Kepala Bidang Ketersediaan" },
  { username: "kabid_distribusi",   email: "kabid.dis@dinpangan.go.id",  role_code: "kepala_bidang_distribusi", nama_lengkap: "Kepala Bidang Distribusi",     unit_kerja: "Bidang Distribusi",           jabatan: "Kepala Bidang Distribusi" },
  { username: "kabid_konsumsi",     email: "kabid.kon@dinpangan.go.id",  role_code: "kepala_bidang_konsumsi",   nama_lengkap: "Kepala Bidang Konsumsi",       unit_kerja: "Bidang Konsumsi",             jabatan: "Kepala Bidang Konsumsi" },
  { username: "kepala_uptd",        email: "kuptd@dinpangan.go.id",      role_code: "kepala_uptd",              nama_lengkap: "Kepala UPTD Balai Pengawasan", unit_kerja: "UPTD Balai Pengawasan Mutu",  jabatan: "Kepala UPTD" },
  { username: "kasubag",            email: "kasubag@dinpangan.go.id",    role_code: "kasubag",                  nama_lengkap: "Kasubag Umum & Kepegawaian",   unit_kerja: "Sekretariat",                 jabatan: "Kasubag Umum dan Kepegawaian" },
  { username: "bendahara",          email: "bendahara@dinpangan.go.id",  role_code: "bendahara",                nama_lengkap: "Bendahara Pengeluaran",        unit_kerja: "Sekretariat",                 jabatan: "Bendahara Pengeluaran" },
  { username: "pelaksana",          email: "pelaksana@dinpangan.go.id",  role_code: "pelaksana",                nama_lengkap: "Staf Pelaksana",               unit_kerja: "Sekretariat",                 jabatan: "Pelaksana" },
];

console.log("\n── Seeding Users ─────────────────────────────────────────────");
for (const u of users) {
  const role_id = roleMap[u.role_code];
  const existing = await User.findOne({ where: { email: u.email } });
  if (existing) {
    await existing.update({ role: u.role_code, role_id });
    console.log(`  ⏭  User exists (synced role): ${u.username}`);
  } else {
    await User.create({
      id_uuid: uuidv4(),
      username: u.username,
      email: u.email,
      password: hash,
      plain_password: PASS,
      role: u.role_code,
      role_id,
      nama_lengkap: u.nama_lengkap,
      name: u.nama_lengkap,
      unit_kerja: u.unit_kerja,
      unit_id: u.unit_kerja,
      jabatan: u.jabatan,
      is_active: true,
      is_verified: true,
      failed_login_attempts: 0,
    });
    console.log(`  ✅ Created user: ${u.username} (${u.role_code})`);
  }
}

console.log(`\n✅ Seeding selesai! Password semua user: ${PASS}`);
await sequelize.close();
