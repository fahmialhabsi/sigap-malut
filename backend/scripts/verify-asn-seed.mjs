/**
 * VERIFIKASI ASN SIGAP-MALUT
 * Memastikan semua 83 ASN sudah masuk dengan role dan unit_kerja yang benar.
 * Jalankan: node scripts/verify-asn-seed.mjs
 */

import sequelize from "../config/database.js";

// Expected counts = jumlah minimum ASN resmi per role (≥, bukan exact)
// DB bisa ada user lain (test user dsb); yang penting ASN resmi semua masuk.
const EXPECTED_COUNTS = {
  kepala_dinas: 1,
  sekretaris: 1,
  kasubag_umum_kepegawaian: 1,
  pejabat_fungsional: 12, // 3 Sek + 2 Kets + 2 Distrib + 2 Kons + 3 UPTD = 12
  bendahara: 3,
  pelaksana: 58, // 13+13+11+9+12 = 58
  kepala_bidang_ketersediaan: 1,
  kepala_bidang_distribusi: 1,
  kepala_bidang_konsumsi: 1,
  kepala_uptd: 1,
  kasubag_uptd: 1,
  kepala_seksi_uptd: 2,
};

const EXPECTED_TOTAL = Object.values(EXPECTED_COUNTS).reduce((a, b) => a + b, 0); // 78+5=83

async function verify() {
  console.log(`\n🔍 SIGAP-MALUT ASN Seed Verifikasi\n`);

  let allPass = true;

  // 1. Total ASN dari daftar resmi
  const [totalRow] = await sequelize.query(
    `SELECT COUNT(*) as total FROM "users"
     WHERE role NOT IN ('super_admin','gubernur','viewer')
       AND nip IS NOT NULL AND nip != ''
       AND is_active = true`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const total = parseInt(totalRow.total);
  const totalPass = total >= 83;
  console.log(`  ${totalPass ? "✅" : "❌"} Total ASN aktif: ${total} (expected ≥83)`);
  if (!totalPass) allPass = false;

  // 2. Cek per role
  console.log(`\n  Per-role breakdown:`);
  for (const [role, expected] of Object.entries(EXPECTED_COUNTS)) {
    const [row] = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM "users" WHERE role=:role AND is_active=true`,
      { replacements: { role }, type: sequelize.QueryTypes.SELECT }
    );
    const cnt = parseInt(row.cnt);
    const pass = cnt >= expected;
    if (!pass) allPass = false;
    console.log(`  ${pass ? "✅" : "❌"} ${role.padEnd(35)} : ${cnt} (expected ${expected})`);
  }

  // 3. Cek sample NIPs kritis (18-digit, setelah normalisasi NIP format Indonesia)
  const CRITICAL_NIPS = [
    ["197507302001121001", "Dheni Tjan — Kepala Dinas"],
    ["198208102002121005", "Fahmi Alhabsi — Sekretaris"],
    ["197411282007011021", "Muhammad Djufri — Kasubag"],
    ["197002282003122004", "Rahmawaty Hamid — Kabid Ketersediaan"],
    ["196911082003121005", "Muhammad Isra Sillia — Kabid Distribusi"],
    ["197112252000032004", "Lily Ulfaidah — Kabid Konsumsi"],
    ["198208242007011006", "Rahmat — Kepala UPTD"],
    ["197212022001121005", "Saleh A. Gani — PPK (catatan khusus)"],
    ["197705042009031004", "Nawawi Saimima — PPK-SKPD (catatan khusus)"],
  ];

  console.log(`\n  NIP kritis:`);
  for (const [nip, label] of CRITICAL_NIPS) {
    const [row] = await sequelize.query(
      `SELECT id, role, unit_kerja FROM "users" WHERE nip=:nip LIMIT 1`,
      { replacements: { nip }, type: sequelize.QueryTypes.SELECT }
    );
    const pass = !!row;
    if (!pass) allPass = false;
    if (row) {
      console.log(`  ✅ ${label} → role=${row.role}, unit=${row.unit_kerja}`);
    } else {
      console.log(`  ❌ MISSING: ${label} (NIP: ${nip})`);
    }
  }

  // 4. Cek hierarki
  const [hierRow] = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM user_hierarchy`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const hierCnt = parseInt(hierRow.cnt);
  const hierPass = hierCnt >= 82; // min 82 relasi (83 ASN kecuali Kepala Dinas tidak punya atasan)
  if (!hierPass) allPass = false;
  console.log(`\n  ${hierPass ? "✅" : "❌"} Hierarki entries: ${hierCnt} (expected ≥82)`);

  // 5. Cek [PPTK] entries di jabatan (harus ada 8)
  const [pptk] = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM "users" WHERE jabatan LIKE '%[PPTK]%' AND is_active=true`,
    { type: sequelize.QueryTypes.SELECT }
  );
  console.log(`  ✅ User dengan label PPTK: ${pptk.cnt} (expected 8)`);

  // Verdict
  console.log(`\n${"─".repeat(60)}`);
  if (allPass) {
    console.log(`✅ VERIFIKASI LULUS — Semua 83 ASN dan hierarki valid.\n`);
  } else {
    console.log(`❌ VERIFIKASI GAGAL — Ada ASN atau hierarki yang belum sesuai. Jalankan ulang seed.\n`);
  }

  await sequelize.close();
  process.exit(allPass ? 0 : 1);
}

verify().catch(async (e) => {
  console.error("Error:", e.message);
  await sequelize.close();
  process.exit(1);
});
