// Kode Klasifikasi Arsip Pemerintah (Perka ANRI No.19/2012)
export const KODE_KLASIFIKASI_ARSIP = {
  "000": "Umum",
  "005": "Pelaporan",
  "005/HM": "Hubungan Masyarakat",
  "850/KP": "Kepegawaian - Kenaikan Pangkat",
  "600/ANG": "Keuangan - Anggaran",
  "600/SPJ": "Surat Pertanggungjawaban",
  "440/KP": "Ketersediaan Pangan",
  "440/DP": "Distribusi Pangan",
  "440/KG": "Konsumsi dan Gizi",
  "900": "Pengawasan",
  "950": "Perlengkapan",
};

// Generate nomor agenda otomatis: AGD-2026-0001
export const generateNomorAgenda = async () => {
  // Import AgendaSurat inline untuk menghindari circular dependency
  const { default: AgendaSurat } = await import("../models/AgendaSurat.js");
  const tahun = new Date().getFullYear();
  const count = await AgendaSurat.count({ where: { jenis: "masuk" } });
  const urut = String(count + 1).padStart(4, "0");
  return `AGD-${tahun}-${urut}`;
};

// Generate nomor surat keluar: 042/ST/DP-MALUT/III/2026
export const generateNomorSuratKeluar = async (jenisNaskah) => {
  const bulanRomawi = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const now = new Date();
  const bulan = bulanRomawi[now.getMonth()];
  const tahun = now.getFullYear();
  const { default: AgendaSurat } = await import("../models/AgendaSurat.js");
  const count = await AgendaSurat.count({ where: { jenis: "keluar" } });
  const urut = String(count + 1).padStart(3, "0");
  return `${urut}/${jenisNaskah}/DP-MALUT/${bulan}/${tahun}`;
};

// Generate kode arsip otomatis berdasarkan perihal
export const generateArsipCode = (perihal = "") => {
  const p = perihal.toLowerCase();
  if (p.includes("ketersediaan") || p.includes("pangan")) return "440/KP";
  if (p.includes("distribusi")) return "440/DP";
  if (p.includes("konsumsi") || p.includes("gizi")) return "440/KG";
  if (p.includes("pegawai") || p.includes("kepegawaian")) return "850/KP";
  if (p.includes("anggaran") || p.includes("keuangan")) return "600/ANG";
  if (p.includes("spj")) return "600/SPJ";
  if (p.includes("laporan")) return "005";
  return "000";
};
