/**
 * SEED ASN SIGAP-MALUT — 83 Pegawai Aktif
 * Dinas Pangan Provinsi Maluku Utara
 *
 * Sumber data: Daftar ASN Resmi Dinas Pangan Provinsi Maluku Utara
 * Divalidasi terhadap: Dokumen 33 (arsitektur), Dokumen 45/48/50/52/54 (pedoman)
 *
 * PENYESUAIAN SKEMA (dilaporkan sesuai instruksi):
 *   - Kolom sub_fungsi tidak ada di DB → disandikan dalam unit_kerja
 *     (misal "Bidang-Ketersediaan" sudah menunjukkan bidang & sub-fungsi)
 *   - Kolom is_pptk tidak ada di DB → disandikan di jabatan dengan prefix "[PPTK]"
 *   - Kolom dpa_unit tidak ada di DB → disandikan di jabatan dengan suffix "(DPA: <unit>)"
 *   - Kolom jenis_jabatan tidak ada di DB → disandikan di jabatan
 *
 * CATATAN KHUSUS:
 *   - Saleh A. Gani (PPK): Wajib miliki sertifikat kompetensi PBJ sebelum aktif sebagai PPK
 *   - Nawawi Saimima (PPK-SKPD): Merangkap Pengadministrasi Perkantoran, ditetapkan KPA
 *   - 3 JF UPTD (Ramli, Siti Kaunar, Hirma): unit_kerja=UPTD-BalaiPMKP (struktural di bawah
 *     Kepala UPTD), penugasan operasional berbeda disandikan di jabatan
 *
 * Jalankan: node scripts/seed-asn-83.mjs
 */

import bcrypt from "bcrypt";
import sequelize from "../config/database.js";

const SALT_ROUNDS = 10;

// ─── Mapping role_db → role kolom DB (lowercase, snake_case) ─────────────────
const ROLE_MAP = {
  KEPALA_DINAS: "kepala_dinas",
  SEKRETARIS: "sekretaris",
  KASUBAG_UMUM_KEPEGAWAIAN: "kasubag_umum_kepegawaian",
  PEJABAT_FUNGSIONAL: "pejabat_fungsional",
  BENDAHARA: "bendahara",
  PELAKSANA: "pelaksana",
  KEPALA_BIDANG_KETERSEDIAAN: "kepala_bidang_ketersediaan",
  KEPALA_BIDANG_DISTRIBUSI: "kepala_bidang_distribusi",
  KEPALA_BIDANG_KONSUMSI: "kepala_bidang_konsumsi",
  KEPALA_UPTD: "kepala_uptd",
  KASUBAG_UPTD: "kasubag_uptd",
  KEPALA_SEKSI_UPTD: "kepala_seksi_uptd",
};

const DASHBOARD_MAP = {
  kepala_dinas: "/dashboard/kepala-dinas",
  sekretaris: "/dashboard/sekretaris",
  kasubag_umum_kepegawaian: "/dashboard/kasubag",
  pejabat_fungsional: "/dashboard/fungsional",
  bendahara: "/dashboard/bendahara",
  pelaksana: "/dashboard/pelaksana",
  kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
  kepala_bidang_distribusi: "/dashboard/distribusi",
  kepala_bidang_konsumsi: "/dashboard/konsumsi",
  kepala_uptd: "/dashboard/uptd",
  kasubag_uptd: "/dashboard/uptd",
  kepala_seksi_uptd: "/dashboard/uptd",
};

// ─── Normalise NIP (hapus semua spasi dan strip karakter non-digit) ───────────
function normNip(raw) {
  return String(raw).replace(/\s+/g, "").replace(/[^0-9]/g, "");
}

// ─── Generate username dari nama + 6 digit terakhir NIP ──────────────────────
function makeUsername(nama, nip) {
  const firstWord = nama
    .split(/[\s,]+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const suffix = nip.slice(-6);
  return `${firstWord}${suffix}`;
}

// ─── DATA 83 ASN ──────────────────────────────────────────────────────────────
// Format: { nip, nama, role_db, unit_kerja, jabatan }
// Keterangan jabatan menyandikan jenis_jabatan, is_pptk, dpa_unit, penugasan

const ASN_DATA = [
  // ═══════════════════════════════════════════════════════════════
  // KEPALA DINAS (1)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19750730 200112 1 001",
    nama: "Dheni Tjan, SH., M.Si",
    role_db: "KEPALA_DINAS",
    unit_kerja: "Dinas",
    jabatan: "Kepala Dinas Pangan",
  },

  // ═══════════════════════════════════════════════════════════════
  // SEKRETARIAT (22)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19820810 200212 1 005",
    nama: "Fahmi Alhabsi, SH., M.Si",
    role_db: "SEKRETARIS",
    unit_kerja: "Sekretariat",
    jabatan: "Sekretaris Dinas",
  },
  {
    nip: "19741128 200701 1 021",
    nama: "Muhammad Djufri, S.Sos",
    role_db: "KASUBAG_UMUM_KEPEGAWAIAN",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Kepala Subbagian Umum dan Kepegawaian",
  },
  {
    nip: "19761220 200604 1 005",
    nama: "Syarifudin Sima, S.Hut., MP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Sekretariat-Perencanaan",
    jabatan: "Pejabat Fungsional Perencana",
  },
  {
    nip: "19770504 200903 1 004",
    nama: "Nawawi Saimima",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Sekretariat-Keuangan",
    // CATATAN: Merangkap Pengadministrasi Perkantoran, ditetapkan KPA
    jabatan: "PPK-SKPD (Pejabat Penatausahaan Keuangan SKPD) — merangkap Pengadministrasi Perkantoran",
  },
  {
    nip: "19721202 200112 1 005",
    nama: "Saleh A. Gani, S.IP., S.ST",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Sekretariat-Pengadaan",
    // CATATAN: Wajib sertifikat kompetensi PBJ sebelum aktif sebagai PPK
    jabatan: "PPK (Pejabat Pembuat Komitmen) — wajib sertifikat kompetensi PBJ",
  },
  {
    nip: "19810818 201101 1 003",
    nama: "Idham Tamin, SP",
    role_db: "BENDAHARA",
    unit_kerja: "Sekretariat-Keuangan",
    jabatan: "Bendahara Pengeluaran",
  },
  {
    nip: "19840217 201001 1 006",
    nama: "Saiful Hi. Amin, S.Pi",
    role_db: "BENDAHARA",
    unit_kerja: "Sekretariat-Keuangan",
    jabatan: "Bendahara Gaji",
  },
  {
    nip: "19821006 201101 1 003",
    nama: "Hasan Drakel, S.Pi., M.Tr.Pi",
    role_db: "BENDAHARA",
    unit_kerja: "Sekretariat-Aset",
    jabatan: "Bendahara Barang",
  },
  {
    nip: "19760229 200312 1 003",
    nama: "Rizali Efendi Amiruddin, S.Pt",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Perencanaan",
    jabatan: "Pelaksana Perencanaan",
  },
  {
    nip: "19800713 200312 1 004",
    nama: "Sadat Assagaf, S.ST",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "[PPTK] Pelaksana Umum Kepegawaian (DPA: Sekretariat)",
  },
  {
    nip: "19810215 200804 2 003",
    nama: "Sri Sulastri Gianti Ningsih, S.TP",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-TI",
    jabatan: "Pelaksana Teknologi Informasi",
  },
  {
    nip: "19751217 200903 2 003",
    nama: "Ulfah Buamona, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-TI",
    jabatan: "Pelaksana Teknologi Informasi",
  },
  {
    nip: "19781204 200801 1 011",
    nama: "Yusri, SE",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-TI",
    jabatan: "Pelaksana Teknologi Informasi",
  },
  {
    nip: "19751018 200112 1 003",
    nama: "Zaharuddin Garwan, SE",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "19750606 200701 1 025",
    nama: "Bahrudin Hadel, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "19840929 201001 1 004",
    nama: "Abdul Rasid Manan",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "19841128 201001 1 007",
    nama: "Mauliya Yazid",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "19860314 201001 2 002",
    nama: "Dewi Irawati Pakaya",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "19781010 200903 1 003",
    nama: "Ismiyadi Iskandar",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },
  {
    nip: "198304302025212018",
    nama: "Nurdiana Umamit, SE",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Keuangan",
    jabatan: "Pelaksana Keuangan",
  },
  {
    nip: "198606302025212070",
    nama: "Onya Usman",
    role_db: "PELAKSANA",
    unit_kerja: "Sekretariat-Umum-Kepegawaian",
    jabatan: "Pelaksana Umum Kepegawaian",
  },

  // ═══════════════════════════════════════════════════════════════
  // BIDANG KETERSEDIAAN DAN KERAWANAN PANGAN (16)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19700228 200312 2 004",
    nama: "Rahmawaty Hamid, S.Pt",
    role_db: "KEPALA_BIDANG_KETERSEDIAAN",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Kepala Bidang Ketersediaan dan Kerawanan Pangan",
  },
  {
    nip: "19750826 200701 1 011",
    nama: "Syamsuddin, SP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "JF Analis Ketahanan Pangan — Bidang Ketersediaan",
  },
  {
    nip: "19931128 202504 2 001",
    nama: "Rahayu Ali, S.TP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "JF Analis Ketahanan Pangan — Bidang Kerawanan",
  },
  {
    nip: "19740512 200112 1 006",
    nama: "Yakub Abd Rahman, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "[PPTK] Pelaksana Ketersediaan Pangan (DPA: Ketersediaan)",
  },
  {
    nip: "19720616 200212 2 008",
    nama: "Rusmini Husen, S.Hut",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Ketersediaan Pangan",
  },
  {
    nip: "19750408 200104 1 001",
    nama: "Anwar M. Nur, SP., M.Sc",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Ketersediaan Pangan",
  },
  {
    nip: "19790628 200501 1 010",
    nama: "Amiruddin N. Hadad, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Ketersediaan Pangan",
  },
  {
    nip: "19770919 200012 2 003",
    nama: "Fahria Ishak, SKM",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Ketersediaan Pangan",
  },
  {
    nip: "19721118 200604 1 010",
    nama: "Achmad Sychbutuh, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Ketersediaan Pangan",
  },
  {
    nip: "19750115 200112 2 003",
    nama: "Janumuhairia Tahir Djama, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "[PPTK] Pelaksana Kerawanan Pangan (DPA: Kerawanan)",
  },
  {
    nip: "19740822 200212 1 005",
    nama: "Rusdi, S.Pt",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },
  {
    nip: "19710109 200312 2 007",
    nama: "Endang Marjati Kasiran, S.Pt",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },
  {
    nip: "19700323 200312 1 010",
    nama: "Rachmat Ismail, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },
  {
    nip: "19711224 200604 2 003",
    nama: "Anik Prihatiningsih, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },
  {
    nip: "19751212 200604 1 012",
    nama: "Muhlis Ahmad, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },
  {
    nip: "19701017 200701 1 015",
    nama: "Rustam Rajak, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Ketersediaan",
    jabatan: "Pelaksana Kerawanan Pangan",
  },

  // ═══════════════════════════════════════════════════════════════
  // BIDANG DISTRIBUSI DAN CADANGAN PANGAN (14)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19691108 200312 1 005",
    nama: "Muhammad Isra Sillia, S.Hut",
    role_db: "KEPALA_BIDANG_DISTRIBUSI",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Kepala Bidang Distribusi dan Cadangan Pangan",
  },
  {
    nip: "19880404 201503 2 002",
    nama: "Rahmawati Daeng Hanafi, S.Gz",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "JF Analis Ketahanan Pangan — Bidang Distribusi",
  },
  {
    nip: "19950430 202505 1 003",
    nama: "Romincap Roda, SP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "JF Analis Ketahanan Pangan — Bidang Cadangan",
  },
  {
    nip: "19800924 200803 2 002",
    nama: "Aisa Lestaluhu, S.Hut",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "[PPTK] Pelaksana Distribusi Pangan (DPA: Distribusi)",
  },
  {
    nip: "19731231 200903 1 002",
    nama: "Safrudin Tuahuns, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Distribusi Pangan",
  },
  {
    nip: "19821030 201001 2 007",
    nama: "Fathia Tamrin, S.Hut",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Distribusi Pangan",
  },
  {
    nip: "19820805 201001 2 008",
    nama: "Agustina Tolosang, SP., M.Si",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Distribusi Pangan",
  },
  {
    nip: "19690123 200604 2 012",
    nama: "Fitri Hayati Aswar ST.Kayo, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Distribusi Pangan",
  },
  {
    nip: "198610132025212017",
    nama: "Pratiwi Rinom, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Distribusi Pangan",
  },
  {
    nip: "19750315 200604 2 040",
    nama: "Marlia Kabir, S.Pi",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "[PPTK] Pelaksana Cadangan Pangan (DPA: Cadangan)",
  },
  {
    nip: "19840819 201101 1 003",
    nama: "Ibnu Hamzah Hanafi, S.TP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Cadangan Pangan",
  },
  {
    nip: "19770515 201001 2 010",
    nama: "Erni Yuliawati, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Cadangan Pangan",
  },
  {
    nip: "19820213 200604 1 015",
    nama: "Fahroji, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Cadangan Pangan",
  },
  {
    nip: "19830225 201503 2 001",
    nama: "Rugaya Renleuw, S.PdI",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Distribusi",
    jabatan: "Pelaksana Cadangan Pangan",
  },

  // ═══════════════════════════════════════════════════════════════
  // BIDANG KONSUMSI DAN KEAMANAN PANGAN (12)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19711225 200003 2 004",
    nama: "Lily Ulfaidah, SP",
    role_db: "KEPALA_BIDANG_KONSUMSI",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Kepala Bidang Konsumsi dan Keamanan Pangan",
  },
  {
    nip: "19800104 200801 2 025",
    nama: "Haeriyani, SP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "JF Analis Pasar Hasil Pertanian — Bidang Konsumsi",
  },
  {
    nip: "19990719 202504 2 008",
    nama: "Elvira Suciyati M. Rato, S.P.",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "JF Analis Ketahanan Pangan — Bidang Keamanan",
  },
  {
    nip: "19840412 200902 2 003",
    nama: "Rosmanita Ali Syamsuddin, S.Farm",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "[PPTK] Pelaksana Konsumsi Pangan (DPA: Konsumsi)",
  },
  {
    nip: "19840904 200801 2 010",
    nama: "Fahdila Maswara, S.Pi",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Konsumsi Pangan",
  },
  {
    nip: "19850325 201501 2 002",
    nama: "Tia Anggraeni Nazh, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Konsumsi Pangan",
  },
  {
    nip: "19890604 201501 1 001",
    nama: "Muhammad Irfai, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Konsumsi Pangan",
  },
  {
    nip: "198809192025212031",
    nama: "Vica, S.Sos",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Konsumsi Pangan",
  },
  {
    nip: "19980131 202203 2 023",
    nama: "Fitriaziah Rizky Mas Ayu, S.TP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "[PPTK] Pelaksana Keamanan Pangan (DPA: Keamanan)",
  },
  {
    nip: "19991008 202504 2 010",
    nama: "Wiwin M. Sagaf, S.P.",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Keamanan Pangan",
  },
  {
    nip: "19910919 202321 1 017",
    nama: "Riswan Muhiddin, SP",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Keamanan Pangan",
  },
  {
    nip: "199101062025211026",
    nama: "Rizki Edrin Laiyan, S.I.Kom",
    role_db: "PELAKSANA",
    unit_kerja: "Bidang-Konsumsi",
    jabatan: "Pelaksana Keamanan Pangan",
  },

  // ═══════════════════════════════════════════════════════════════
  // UPTD BALAI PMKP (19)
  // ═══════════════════════════════════════════════════════════════
  {
    nip: "19820824 200701 1 006",
    nama: "Rahmat, S.Pi",
    role_db: "KEPALA_UPTD",
    unit_kerja: "UPTD-BalaiPMKP",
    jabatan: "Kepala UPTD Balai Pengujian Mutu dan Keamanan Produk",
  },
  {
    nip: "19800303 200903 1 005",
    nama: "Muhammad Idris, SP",
    role_db: "KASUBAG_UPTD",
    unit_kerja: "UPTD-TU",
    jabatan: "Kepala Subbagian Tata Usaha UPTD",
  },
  {
    nip: "19740930 200501 1 008",
    nama: "Rudi Abbas, S.Pt., M.Si",
    role_db: "KEPALA_SEKSI_UPTD",
    unit_kerja: "UPTD-Mutu",
    jabatan: "Kepala Seksi Manajemen Mutu",
  },
  {
    nip: "19860824 201101 2 006",
    nama: "Dr. Rofita, S.P., M.Sc",
    role_db: "KEPALA_SEKSI_UPTD",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Kepala Seksi Manajemen Teknis",
  },
  // CATATAN 3 JF UPTD: unit_kerja=UPTD-BalaiPMKP (struktural di bawah Kepala UPTD)
  // penugasan operasional disandikan di jabatan
  {
    nip: "19721101 201001 1 004",
    nama: "Ramli M. Kompeni, S.TP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "UPTD-BalaiPMKP",
    jabatan: "JF PMKP — ditugaskan di Unit Tata Usaha",
  },
  {
    nip: "19690420 200212 2 009",
    nama: "Siti Kaunar, SP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "UPTD-BalaiPMKP",
    jabatan: "JF PMKP — ditugaskan di Unit Manajemen Mutu",
  },
  {
    nip: "19760105 200604 2 025",
    nama: "Hirma B. Rahman, SP",
    role_db: "PEJABAT_FUNGSIONAL",
    unit_kerja: "UPTD-BalaiPMKP",
    jabatan: "JF PMKP — ditugaskan di Unit Manajemen Teknis",
  },
  // Pelaksana UPTD — TU
  {
    nip: "199407072025212021",
    nama: "Fraharsini S. Doa, SP",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-TU",
    jabatan: "[PPTK] Pelaksana Tata Usaha UPTD (DPA: UPTD-TU)",
  },
  {
    nip: "199801072025211013",
    nama: "M. Azwir Marsaoly, S.Ak",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-TU",
    jabatan: "Pelaksana Tata Usaha UPTD",
  },
  {
    nip: "197207202025211007",
    nama: "Ikbal Bayau",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-TU",
    jabatan: "Pelaksana Tata Usaha UPTD",
  },
  // Pelaksana UPTD — Mutu
  {
    nip: "197508192025212004",
    nama: "Tri Mulyanti Manoppo",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Mutu",
    jabatan: "[PPTK] Pelaksana Manajemen Mutu (DPA: UPTD-Mutu)",
  },
  {
    nip: "197702162025212005",
    nama: "Munalissa",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Mutu",
    jabatan: "Pelaksana Manajemen Mutu",
  },
  // Pelaksana UPTD — Teknis
  {
    nip: "198601112025212011",
    nama: "Reny Ekawati Hasbu",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "[PPTK] Pelaksana Manajemen Teknis (DPA: UPTD-Teknis)",
  },
  {
    nip: "198607102025212035",
    nama: "Lidya Kandou",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
  {
    nip: "199404282025211015",
    nama: "Ratno Fajar Ali A. Ismail",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
  {
    nip: "199407222025211019",
    nama: "Bayu Putra Daeng Harun",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
  {
    nip: "199907012025211007",
    nama: "Amiruddin Ahmad",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
  {
    nip: "196810172025212012",
    nama: "Farida A Rahman",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
  {
    nip: "199604012025211091",
    nama: "Muhammad Irsyad M Kamis",
    role_db: "PELAKSANA",
    unit_kerja: "UPTD-Teknis",
    jabatan: "Pelaksana Manajemen Teknis",
  },
];

// ─── Hierarki: bawahan_nip → atasan_nip ──────────────────────────────────────
// PENTING: Gunakan format NIP asli (dengan spasi) agar normNip() konsisten
// dengan ASN_DATA. Jangan hardcode NIP tanpa spasi secara manual.
const HIERARCHY_RAW = [
  // Sekretariat
  ["19820810 200212 1 005", "19750730 200112 1 001"],  // Sekretaris → Kepala Dinas
  ["19741128 200701 1 021", "19820810 200212 1 005"],  // Kasubag → Sekretaris
  ["19761220 200604 1 005", "19820810 200212 1 005"],  // JF Perencana → Sekretaris
  ["19770504 200903 1 004", "19820810 200212 1 005"],  // PPK-SKPD → Sekretaris
  ["19721202 200112 1 005", "19820810 200212 1 005"],  // PPK → Sekretaris
  ["19810818 201101 1 003", "19820810 200212 1 005"],  // Bendahara Pengeluaran → Sekretaris
  ["19840217 201001 1 006", "19820810 200212 1 005"],  // Bendahara Gaji → Sekretaris
  ["19821006 201101 1 003", "19820810 200212 1 005"],  // Bendahara Barang → Sekretaris
  ["19760229 200312 1 003", "19741128 200701 1 021"],  // Pelaksana Perencana → Kasubag
  ["19800713 200312 1 004", "19741128 200701 1 021"],  // PPTK Sekretariat → Kasubag
  ["19810215 200804 2 003", "19741128 200701 1 021"],  // Pelaksana TI → Kasubag
  ["19751217 200903 2 003", "19741128 200701 1 021"],  // Pelaksana TI → Kasubag
  ["19781204 200801 1 011", "19741128 200701 1 021"],  // Pelaksana TI → Kasubag
  ["19751018 200112 1 003", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["19750606 200701 1 025", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["19840929 201001 1 004", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["19841128 201001 1 007", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["19860314 201001 2 002", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["19781010 200903 1 003", "19741128 200701 1 021"],  // Pelaksana → Kasubag
  ["198304302025212018",    "19820810 200212 1 005"],  // Pelaksana Keuangan → Sekretaris
  ["198606302025212070",    "19741128 200701 1 021"],  // Pelaksana → Kasubag
  // Bidang Ketersediaan
  ["19700228 200312 2 004", "19750730 200112 1 001"],  // Kabid → Kepala Dinas
  ["19750826 200701 1 011", "19700228 200312 2 004"],  // JF 1 → Kabid
  ["19931128 202504 2 001", "19700228 200312 2 004"],  // JF 2 → Kabid
  ["19740512 200112 1 006", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19720616 200212 2 008", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19750408 200104 1 001", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19790628 200501 1 010", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19770919 200012 2 003", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19721118 200604 1 010", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19750115 200112 2 003", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19740822 200212 1 005", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19710109 200312 2 007", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19700323 200312 1 010", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19711224 200604 2 003", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19751212 200604 1 012", "19700228 200312 2 004"],  // Pelaksana → Kabid
  ["19701017 200701 1 015", "19700228 200312 2 004"],  // Pelaksana → Kabid
  // Bidang Distribusi
  ["19691108 200312 1 005", "19750730 200112 1 001"],  // Kabid → Kepala Dinas
  ["19880404 201503 2 002", "19691108 200312 1 005"],  // JF 1 → Kabid
  ["19950430 202505 1 003", "19691108 200312 1 005"],  // JF 2 → Kabid
  ["19800924 200803 2 002", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19731231 200903 1 002", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19821030 201001 2 007", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19820805 201001 2 008", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19690123 200604 2 012", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["198610132025212017",    "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19750315 200604 2 040", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19840819 201101 1 003", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19770515 201001 2 010", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19820213 200604 1 015", "19691108 200312 1 005"],  // Pelaksana → Kabid
  ["19830225 201503 2 001", "19691108 200312 1 005"],  // Pelaksana → Kabid
  // Bidang Konsumsi
  ["19711225 200003 2 004", "19750730 200112 1 001"],  // Kabid → Kepala Dinas
  ["19800104 200801 2 025", "19711225 200003 2 004"],  // JF 1 → Kabid
  ["19990719 202504 2 008", "19711225 200003 2 004"],  // JF 2 → Kabid
  ["19840412 200902 2 003", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19840904 200801 2 010", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19850325 201501 2 002", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19890604 201501 1 001", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["198809192025212031",    "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19980131 202203 2 023", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19991008 202504 2 010", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["19910919 202321 1 017", "19711225 200003 2 004"],  // Pelaksana → Kabid
  ["199101062025211026",    "19711225 200003 2 004"],  // Pelaksana → Kabid
  // UPTD
  ["19820824 200701 1 006", "19750730 200112 1 001"],  // Kepala UPTD → Kepala Dinas
  ["19800303 200903 1 005", "19820824 200701 1 006"],  // Kasubag TU → Kepala UPTD
  ["19740930 200501 1 008", "19820824 200701 1 006"],  // Kasi Mutu → Kepala UPTD
  ["19860824 201101 2 006", "19820824 200701 1 006"],  // Kasi Teknis → Kepala UPTD
  ["19721101 201001 1 004", "19820824 200701 1 006"],  // JF 1 → Kepala UPTD
  ["19690420 200212 2 009", "19820824 200701 1 006"],  // JF 2 → Kepala UPTD
  ["19760105 200604 2 025", "19820824 200701 1 006"],  // JF 3 → Kepala UPTD
  ["199407072025212021",    "19800303 200903 1 005"],  // Pelaksana TU → Kasubag TU
  ["199801072025211013",    "19800303 200903 1 005"],  // Pelaksana TU → Kasubag TU
  ["197207202025211007",    "19800303 200903 1 005"],  // Pelaksana TU → Kasubag TU
  ["197508192025212004",    "19740930 200501 1 008"],  // Pelaksana Mutu → Kasi Mutu
  ["197702162025212005",    "19740930 200501 1 008"],  // Pelaksana Mutu → Kasi Mutu
  ["198601112025212011",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["198607102025212035",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["199404282025211015",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["199407222025211019",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["199907012025211007",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["196810172025212012",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
  ["199604012025211091",    "19860824 201101 2 006"],  // Pelaksana Teknis → Kasi Teknis
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function seedASN() {
  const t = await sequelize.transaction();

  const results = { created: 0, updated: 0, failed: [], hierarchy_created: 0 };
  const nipToId = {}; // nip → db id

  console.log(`\n🌱 SIGAP-MALUT ASN Seed — ${ASN_DATA.length} ASN\n`);

  try {
    // ── Phase 1: Upsert users ──────────────────────────────────────────────
    for (const asn of ASN_DATA) {
      const nip = normNip(asn.nip);
      const role = ROLE_MAP[asn.role_db];
      if (!role) {
        results.failed.push({ nip, reason: `Role ${asn.role_db} tidak dikenal` });
        continue;
      }

      const plainPw = `SIGAP_${nip}_2026`;
      const hashedPw = await bcrypt.hash(plainPw, SALT_ROUNDS);
      const username = makeUsername(asn.nama, nip);
      const email = `${nip}@dinpangan.malutprov.go.id`;
      const dashboardUrl = DASHBOARD_MAP[role] || "/dashboard";

      const userData = {
        username,
        email,
        password: hashedPw,
        plain_password: plainPw,
        nama_lengkap: asn.nama,
        name: asn.nama,
        nip,
        role,
        unit_kerja: asn.unit_kerja,
        unit_id: asn.unit_kerja,
        jabatan: asn.jabatan,
        dashboardUrl,
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      try {
        // Cek apakah NIP sudah ada
        const [rows] = await sequelize.query(
          `SELECT id FROM "users" WHERE nip = :nip LIMIT 1`,
          { replacements: { nip }, type: sequelize.QueryTypes.SELECT, transaction: t }
        );

        if (rows) {
          // UPDATE existing
          await sequelize.query(
            `UPDATE "users" SET
               nama_lengkap=:nama_lengkap, name=:name, role=:role,
               unit_kerja=:unit_kerja, unit_id=:unit_id, jabatan=:jabatan,
               "dashboardUrl"=:dashboardUrl, is_active=:is_active,
               updated_at=now()
             WHERE nip=:nip`,
            {
              replacements: {
                nama_lengkap: asn.nama, name: asn.nama, role, nip,
                unit_kerja: asn.unit_kerja, unit_id: asn.unit_kerja,
                jabatan: asn.jabatan, dashboardUrl, is_active: true,
              },
              transaction: t,
            }
          );
          nipToId[nip] = rows.id;
          results.updated++;
          console.log(`  📝 UPDATE: ${asn.nama} [${role}]`);
        } else {
          // INSERT baru
          const [[newRow]] = await sequelize.query(
            `INSERT INTO "users"
               (username, email, password, plain_password, nama_lengkap, name, nip,
                role, unit_kerja, unit_id, jabatan, "dashboardUrl",
                is_active, is_verified, created_at, updated_at)
             VALUES
               (:username, :email, :password, :plain_password, :nama_lengkap, :name, :nip,
                :role, :unit_kerja, :unit_id, :jabatan, :dashboardUrl,
                :is_active, :is_verified, now(), now())
             RETURNING id`,
            { replacements: { ...userData }, transaction: t }
          );
          nipToId[nip] = newRow.id;
          results.created++;
          console.log(`  ✅ CREATE: ${asn.nama} [${role}] — pwd: ${plainPw}`);
        }
      } catch (err) {
        // Username clash — append uniquifier
        if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
          const altUsername = `${username}_${nip.slice(-4)}`;
          try {
            const [[newRow2]] = await sequelize.query(
              `INSERT INTO "users"
                 (username, email, password, plain_password, nama_lengkap, name, nip,
                  role, unit_kerja, unit_id, jabatan, "dashboardUrl",
                  is_active, is_verified, created_at, updated_at)
               VALUES
                 (:username, :email, :password, :plain_password, :nama_lengkap, :name, :nip,
                  :role, :unit_kerja, :unit_id, :jabatan, :dashboardUrl,
                  :is_active, :is_verified, now(), now())
               RETURNING id`,
              { replacements: { ...userData, username: altUsername }, transaction: t }
            );
            nipToId[nip] = newRow2.id;
            results.created++;
            console.log(`  ✅ CREATE (alt username): ${asn.nama} [${role}]`);
          } catch (err2) {
            results.failed.push({ nip, nama: asn.nama, reason: err2.message });
            console.error(`  ❌ FAIL: ${asn.nama} — ${err2.message}`);
          }
        } else {
          results.failed.push({ nip, nama: asn.nama, reason: err.message });
          console.error(`  ❌ FAIL: ${asn.nama} — ${err.message}`);
        }
      }
    }

    // ── Phase 1.5: Refresh nipToId dari DB (pastikan semua NIP tercakup) ─────
    const dbUsers = await sequelize.query(
      `SELECT id, nip FROM "users" WHERE nip IS NOT NULL AND nip != ''`,
      { type: sequelize.QueryTypes.SELECT, transaction: t }
    );
    for (const u of dbUsers) nipToId[u.nip] = u.id;

    // ── Phase 2: Build UserHierarchy ──────────────────────────────────────
    console.log(`\n🔗 Membangun hierarki atasan-bawahan...\n`);

    for (const [bawahanNipRaw, atasanNipRaw] of HIERARCHY_RAW) {
      const bawahanNip = normNip(bawahanNipRaw);
      const atasanNip  = normNip(atasanNipRaw);
      const bawahanId  = nipToId[bawahanNip];
      const atasanId   = nipToId[atasanNip];

      if (!bawahanId || !atasanId) {
        console.warn(`  ⚠️  Lewati hierarki: ${bawahanNip} → ${atasanNip} (user tidak ditemukan)`);
        continue;
      }

      // Cek apakah relasi sudah ada (pakai nama kolom aktual di DB)
      const [existing] = await sequelize.query(
        `SELECT id FROM user_hierarchy WHERE user_id=:b AND supervisor_id=:a LIMIT 1`,
        { replacements: { b: bawahanId, a: atasanId }, type: sequelize.QueryTypes.SELECT, transaction: t }
      );

      if (!existing) {
        await sequelize.query(
          `INSERT INTO user_hierarchy (user_id, supervisor_id, has_subordinate, unit_kerja, created_at, updated_at)
           VALUES (:b, :a, false, :unit, now(), now())`,
          { replacements: { a: atasanId, b: bawahanId, unit: "" }, transaction: t }
        );
        results.hierarchy_created++;
      }
    }

    await t.commit();

    // ── Ringkasan ─────────────────────────────────────────────────────────
    console.log(`\n${"═".repeat(60)}`);
    console.log(`SIGAP-MALUT ASN Seed — SELESAI`);
    console.log(`${"═".repeat(60)}`);
    console.log(`  ✅ User dibuat      : ${results.created}`);
    console.log(`  📝 User diperbarui  : ${results.updated}`);
    console.log(`  🔗 Hierarki dibuat  : ${results.hierarchy_created}`);
    console.log(`  ❌ Gagal            : ${results.failed.length}`);
    if (results.failed.length > 0) {
      console.log(`\n  Detail gagal:`);
      results.failed.forEach(f => console.log(`    - ${f.nip} ${f.nama || ""}: ${f.reason}`));
    }
    console.log(`\n  Total diproses: ${results.created + results.updated + results.failed.length}/83`);
    console.log(`${"═".repeat(60)}\n`);
    console.log(`  ⚠️  PENTING — Password awal: SIGAP_<NIP>_2026`);
    console.log(`  ⚠️  Minta setiap ASN ganti password saat login pertama.\n`);

  } catch (err) {
    await t.rollback();
    console.error(`\n❌ SEED GAGAL — rollback dilakukan. Error: ${err.message}\n`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedASN();
