import sequelize from "../../config/database.js";
import { hashPassword } from "../../config/auth.js";

function mkUser({
  email,
  username,
  nama_lengkap,
  role,
  unit_kerja,
  jabatan = null,
  nip = null,
}) {
  return {
    email,
    username,
    nama_lengkap,
    name: nama_lengkap,
    password: null, // diisi setelah hash
    role,
    unit_kerja,
    jabatan,
    nip,
    is_active: true,
    is_verified: true,
  };
}

export async function seedUsers() {
  console.log("👤 Seeding users...\n");

  const pwd = "Password123"; // memenuhi policy default (upper+lower+number)
  const hashed = await hashPassword(pwd);
  const dialect = sequelize.getDialect();

  const users = [
    mkUser({
      email: "super_admin@example.com",
      username: "super_admin",
      nama_lengkap: "Super Admin",
      role: "super_admin",
      unit_kerja: "Sekretariat",
      jabatan: "Administrator Sistem",
    }),
    mkUser({
      email: "gubernur@example.com",
      username: "gubernur",
      nama_lengkap: "Gubernur",
      role: "gubernur",
      unit_kerja: "Pemerintah Provinsi",
      jabatan: "Gubernur",
    }),
    mkUser({
      email: "sekretaris@example.com",
      username: "sekretaris",
      nama_lengkap: "Sekretaris",
      role: "sekretaris",
      unit_kerja: "Sekretariat",
      jabatan: "Sekretaris Dinas",
    }),
    mkUser({
      email: "kepala_bidang_ketersediaan@example.com",
      username: "kabid_ketersediaan",
      nama_lengkap: "Kabid Ketersediaan",
      role: "kepala_bidang_ketersediaan",
      unit_kerja: "Bidang Ketersediaan",
      jabatan: "Kepala Bidang Ketersediaan",
    }),
    mkUser({
      email: "kepala_bidang_distribusi@example.com",
      username: "kabid_distribusi",
      nama_lengkap: "Kabid Distribusi",
      role: "kepala_bidang_distribusi",
      unit_kerja: "Bidang Distribusi",
      jabatan: "Kepala Bidang Distribusi",
    }),
    mkUser({
      email: "kepala_bidang_konsumsi@example.com",
      username: "kabid_konsumsi",
      nama_lengkap: "Kabid Konsumsi",
      role: "kepala_bidang_konsumsi",
      unit_kerja: "Bidang Konsumsi",
      jabatan: "Kepala Bidang Konsumsi",
    }),
    mkUser({
      email: "kepala_uptd@example.com",
      username: "kepala_uptd",
      nama_lengkap: "Kepala UPTD",
      role: "kepala_uptd",
      unit_kerja: "UPTD",
      jabatan: "Kepala UPTD",
    }),
    mkUser({
      email: "publik@example.com",
      username: "publik",
      nama_lengkap: "Publik",
      role: "publik",
      unit_kerja: "Publik",
      jabatan: "Viewer",
    }),

    // === Prompt 4 demo: 1 Kasubag + beberapa Pelaksana + 3 Bendahara ===
    mkUser({
      email: "kasubag.uk@example.com",
      username: "kasubag_uk",
      nama_lengkap: "Kasubag Umum & Kepegawaian",
      role: "kasubag_umum_kepegawaian",
      unit_kerja: "Sekretariat",
      jabatan: "Kasubag Umum & Kepegawaian",
    }),
    mkUser({
      email: "pelaksana.a@example.com",
      username: "pelaksana_a",
      nama_lengkap: "Pelaksana A",
      role: "pelaksana",
      unit_kerja: "Sekretariat",
      jabatan: "Pelaksana Kepegawaian",
    }),
    mkUser({
      email: "pelaksana.b@example.com",
      username: "pelaksana_b",
      nama_lengkap: "Pelaksana B",
      role: "pelaksana",
      unit_kerja: "Sekretariat",
      jabatan: "Pelaksana Persuratan/Arsip",
    }),
    mkUser({
      email: "pelaksana.c@example.com",
      username: "pelaksana_c",
      nama_lengkap: "Pelaksana C",
      role: "pelaksana",
      unit_kerja: "Sekretariat",
      jabatan: "Pelaksana Umum/Rumah Tangga",
    }),
    mkUser({
      email: "bendahara.pengeluaran@example.com",
      username: "bendahara_pengeluaran",
      nama_lengkap: "Bendahara Pengeluaran",
      role: "bendahara_pengeluaran",
      unit_kerja: "Sekretariat",
      jabatan: "Bendahara Pengeluaran",
    }),
    mkUser({
      email: "bendahara.gaji@example.com",
      username: "bendahara_gaji",
      nama_lengkap: "Bendahara Gaji",
      role: "bendahara_gaji",
      unit_kerja: "Sekretariat",
      jabatan: "Bendahara Gaji",
    }),
    mkUser({
      email: "bendahara.barang@example.com",
      username: "bendahara_barang",
      nama_lengkap: "Bendahara Barang",
      role: "bendahara_barang",
      unit_kerja: "Sekretariat",
      jabatan: "Bendahara Barang",
    }),

    // JF Sekretariat (Prompt 5/6)
    mkUser({
      email: "jf.perencanaan@example.com",
      username: "jf_perencanaan",
      nama_lengkap: "JF Perencanaan",
      role: "fungsional_perencana",
      unit_kerja: "Sekretariat",
      jabatan: "Pejabat Fungsional Perencana",
    }),
    mkUser({
      email: "jf.keuangan@example.com",
      username: "jf_keuangan",
      nama_lengkap: "JF Keuangan / PPK",
      role: "fungsional_keuangan",
      unit_kerja: "Sekretariat",
      jabatan: "Pejabat Fungsional Keuangan (PPK)",
    }),
  ].map((u) => ({ ...u, password: hashed }));

  for (const u of users) {
    if (dialect === "postgres") {
      await sequelize.query(
        `INSERT INTO users
          (username, email, password, nama_lengkap, name, nip, role, unit_kerja, jabatan,
           is_active, is_verified, created_at, updated_at)
         VALUES
          (:username, :email, :password, :nama_lengkap, :name, :nip, :role, :unit_kerja, :jabatan,
           :is_active, :is_verified, now(), now())
         ON CONFLICT DO NOTHING`,
        {
          replacements: {
            username: u.username,
            email: u.email,
            password: u.password,
            nama_lengkap: u.nama_lengkap,
            name: u.name,
            nip: u.nip,
            role: u.role,
            unit_kerja: u.unit_kerja,
            jabatan: u.jabatan,
            is_active: u.is_active,
            is_verified: u.is_verified,
          },
        },
      );
    } else {
      await sequelize.query(
        `INSERT OR IGNORE INTO users
          (username, email, password, nama_lengkap, name, nip, role, unit_kerja, jabatan,
           is_active, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        {
          replacements: [
            u.username,
            u.email,
            u.password,
            u.nama_lengkap,
            u.name,
            u.nip,
            u.role,
            u.unit_kerja,
            u.jabatan,
            u.is_active,
            u.is_verified,
          ],
        },
      );
    }
  }

  console.log(`  ✅ Users seeded: ${users.length} (password demo: ${pwd})\n`);
}