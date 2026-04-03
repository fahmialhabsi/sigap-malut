export const ROLE_LABELS = {
  sekretaris: "Sekretaris",
  kasubag_umum_kepegawaian: "Kasubag Umum & Kepegawaian",
  fungsional_perencanaan: "Fungsional Perencanaan",
  fungsional_keuangan: "Fungsional Keuangan / PPK",
  bendahara_pengeluaran: "Bendahara Pengeluaran",
  bendahara_gaji: "Bendahara Gaji",
  bendahara_barang: "Bendahara Barang",
  kepala_bidang_ketersediaan: "Kepala Bidang Ketersediaan",
  kepala_bidang_distribusi: "Kepala Bidang Distribusi",
  kepala_bidang_konsumsi: "Kepala Bidang Konsumsi",
  kepala_uptd: "Kepala UPTD Balai Pengawasan",
};

const ROLE_REFERENCE_CODES = {
  sekretaris: "SEK",
  kasubag_umum_kepegawaian: "KSB",
  fungsional_perencanaan: "JFP",
  fungsional_keuangan: "JFK",
  bendahara_pengeluaran: "BPG",
  bendahara_gaji: "BGJ",
  bendahara_barang: "BBR",
  kepala_bidang_ketersediaan: "KBK",
  kepala_bidang_distribusi: "KBD",
  kepala_bidang_konsumsi: "KBKNS",
  kepala_uptd: "UPTD",
};

export const SEKRETARIS_SUBORDINATE_TARGET_OPTIONS = [
  {
    value: "kasubag_umum_kepegawaian",
    label: ROLE_LABELS.kasubag_umum_kepegawaian,
  },
  {
    value: "fungsional_perencanaan",
    label: ROLE_LABELS.fungsional_perencanaan,
  },
  {
    value: "fungsional_keuangan",
    label: ROLE_LABELS.fungsional_keuangan,
  },
  {
    value: "bendahara_pengeluaran",
    label: ROLE_LABELS.bendahara_pengeluaran,
  },
  {
    value: "bendahara_gaji",
    label: ROLE_LABELS.bendahara_gaji,
  },
  {
    value: "bendahara_barang",
    label: ROLE_LABELS.bendahara_barang,
  },
];

export const SEKRETARIS_COORDINATION_TARGET_OPTIONS = [
  {
    value: "kepala_bidang_ketersediaan",
    label: ROLE_LABELS.kepala_bidang_ketersediaan,
  },
  {
    value: "kepala_bidang_distribusi",
    label: ROLE_LABELS.kepala_bidang_distribusi,
  },
  {
    value: "kepala_bidang_konsumsi",
    label: ROLE_LABELS.kepala_bidang_konsumsi,
  },
  {
    value: "kepala_uptd",
    label: ROLE_LABELS.kepala_uptd,
  },
];

export const SEKRETARIS_ONLY_TARGET_OPTION = [
  { value: "sekretaris", label: ROLE_LABELS.sekretaris },
];

export const COORDINATION_KIND_OPTIONS = [
  { value: "koordinasi", label: "Koordinasi" },
];

export const COMMAND_KIND_OPTIONS = [{ value: "perintah", label: "Perintah" }];

export const COMMAND_EXPECTED_OUTPUT_OPTIONS = [
  { value: "Laporan tindak lanjut", label: "Laporan tindak lanjut" },
  { value: "Data dukung", label: "Data dukung" },
  { value: "Rencana aksi", label: "Rencana aksi" },
  { value: "Draft dokumen", label: "Draft dokumen" },
  { value: "Konfirmasi penyelesaian", label: "Konfirmasi penyelesaian" },
];

export const COORDINATION_EXPECTED_OUTPUT_OPTIONS = [
  { value: "Bahan koordinasi", label: "Bahan koordinasi" },
  { value: "Data dukung", label: "Data dukung" },
  { value: "Rencana tindak lanjut", label: "Rencana tindak lanjut" },
  { value: "Notulen / ringkasan hasil", label: "Notulen / ringkasan hasil" },
  { value: "Tanggapan resmi", label: "Tanggapan resmi" },
];

function toDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildAutoReference({
  kind = "koordinasi",
  targetRole,
  actorCode = "SIGAP",
}) {
  const cleanKind = String(kind || "koordinasi").toLowerCase();
  const kindCode = cleanKind === "perintah" ? "PRT" : "KOR";
  const targetCode =
    ROLE_REFERENCE_CODES[String(targetRole || "").toLowerCase()] || "UMUM";
  return `${kindCode}/${actorCode}/${targetCode}/${toDateStamp()}`;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[String(role || "").toLowerCase()] || role || "-";
}
