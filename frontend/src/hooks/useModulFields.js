/**
 * useModulFields.js — Hook untuk memuat definisi field modul dari FIELDS CSV
 *
 * Mengambil field definition dari master-data yang di-serve secara statis.
 * Mendukung semua 94 modul (FIELDS_M001.csv … FIELDS_M084.csv, SA01…SA10, SEK-*, dll.)
 *
 * Penggunaan:
 *   const { fields, loading, error } = useModulFields("M001");  // Data ASN
 *   const { fields } = useModulFields("M022");                  // SPJ
 *   const { fields } = useModulFields("SEK-KEP");               // Layanan Kepegawaian
 */
import { useEffect, useState } from "react";

// Pemetaan modul_id ke path file CSV di /master-data/
function resolveFieldsPath(modulId) {
  const id = String(modulId || "").toUpperCase().trim();

  // Format M001–M084
  if (/^M\d{3}$/.test(id)) {
    return `/master-data/FIELDS/FIELDS_${id}.csv`;
  }

  // Format SA01–SA10
  if (/^SA\d{2}$/.test(id)) {
    return `/master-data/FIELDS/${id}_fields.csv`;
  }

  // Format SEK-*, BKT-*, BDS-*, BKS-*, UPT-* (dari FIELDS_SEKRETARIAT dll.)
  if (id.startsWith("SEK-")) {
    return `/master-data/FIELDS_SEKRETARIAT/${id}_fields.csv`;
  }
  if (id.startsWith("BKT-")) {
    return `/master-data/FIELDS_BIDANG_KETERSEDIAAN/${id}_fields.csv`;
  }
  if (id.startsWith("BDS-")) {
    return `/master-data/FIELDS_BIDANG_DISTRIBUSI/${id}_fields.csv`;
  }
  if (id.startsWith("BKS-")) {
    return `/master-data/FIELDS_BIDANG_KONSUMSI/${id}_fields.csv`;
  }
  if (id.startsWith("UPT-")) {
    return `/master-data/FIELDS_UPTD/${id}_fields.csv`;
  }

  // Fallback: coba FIELDS folder
  return `/master-data/FIELDS/FIELDS_${id}.csv`;
}

// Parse CSV sederhana (satu baris = satu field, header baris pertama)
function parseFieldsCsv(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    // Handle quoted CSV values
    const values = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    values.push(cur.trim());

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx].replace(/^"|"$/g, "") : "";
    });
    return obj;
  });
}

// ─── Hook utama ───────────────────────────────────────────────────────────────
export function useModulFields(modulId) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!modulId) {
      setFields([]);
      return;
    }

    setLoading(true);
    setError(null);

    const path = resolveFieldsPath(modulId);
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Field definition tidak ditemukan: ${path}`);
        return res.text();
      })
      .then((text) => {
        const parsed = parseFieldsCsv(text);
        setFields(parsed);
      })
      .catch((err) => {
        setError(err.message);
        setFields([]);
      })
      .finally(() => setLoading(false));
  }, [modulId]);

  return { fields, loading, error };
}

// ─── Mapping lengkap semua 94 modul ke endpoint API backend ──────────────────
export const MODUL_API_MAP = {
  // ── Sekretariat M001–M031 ──────────────────────────────────────────────────
  M001: { endpoint: "/api/sek-adm",  label: "Data ASN",                unit: "Sekretariat" },
  M002: { endpoint: "/api/kgb",      label: "Tracking KGB",            unit: "Sekretariat" },
  M003: { endpoint: "/api/sek-kep",  label: "Tracking Kenaikan Pangkat", unit: "Sekretariat" },
  M004: { endpoint: "/api/sek-kep",  label: "Tracking Penghargaan",    unit: "Sekretariat" },
  M005: { endpoint: "/api/sek-kep",  label: "Data Cuti",               unit: "Sekretariat" },
  M006: { endpoint: "/api/sek-lup",  label: "SPPD / Perjalanan Dinas", unit: "Sekretariat" },
  M007: { endpoint: "/api/sek-kep",  label: "Diklat & Pelatihan",      unit: "Sekretariat" },
  M008: { endpoint: "/api/sek-kep",  label: "SKP (Sasaran Kinerja Pegawai)", unit: "Sekretariat" },
  M009: { endpoint: "/api/sek-adm",  label: "Database Kepegawaian",    unit: "Sekretariat" },
  M010: { endpoint: "/api/sek-adm",  label: "Arsip Digital Kepegawaian", unit: "Sekretariat" },
  M011: { endpoint: "/api/sek-hum",  label: "Surat Masuk",             unit: "Sekretariat" },
  M012: { endpoint: "/api/sek-hum",  label: "Surat Keluar",            unit: "Sekretariat" },
  M013: { endpoint: "/api/sek-hum",  label: "Disposisi Surat",         unit: "Sekretariat" },
  M014: { endpoint: "/api/sek-adm",  label: "Agenda Kegiatan",         unit: "Sekretariat" },
  M015: { endpoint: "/api/sek-adm",  label: "Notulensi Rapat",         unit: "Sekretariat" },
  M016: { endpoint: "/api/sek-ast",  label: "Data Aset Barang",        unit: "Sekretariat" },
  M017: { endpoint: "/api/sek-ast",  label: "Data Kendaraan Dinas",    unit: "Sekretariat" },
  M018: { endpoint: "/api/sek-ast",  label: "Pemeliharaan Aset",       unit: "Sekretariat" },
  M019: { endpoint: "/api/sek-ast",  label: "Mutasi Aset",             unit: "Sekretariat" },
  M020: { endpoint: "/api/sek-keu",  label: "DPA (Dokumen Pelaksanaan Anggaran)", unit: "Sekretariat" },
  M021: { endpoint: "/api/sek-keu",  label: "RKA (Rencana Kerja Anggaran)", unit: "Sekretariat" },
  M022: { endpoint: "/api/sek-keu",  label: "SPJ (Surat Pertanggungjawaban)", unit: "Sekretariat" },
  M023: { endpoint: "/api/sek-keu",  label: "Realisasi Anggaran",      unit: "Sekretariat" },
  M024: { endpoint: "/api/sek-keu",  label: "Belanja Pegawai",         unit: "Sekretariat" },
  M025: { endpoint: "/api/sek-keu",  label: "Belanja Barang",          unit: "Sekretariat" },
  M026: { endpoint: "/api/sek-keu",  label: "Belanja Modal",           unit: "Sekretariat" },
  M027: { endpoint: "/api/renstra",  label: "Renstra",                 unit: "Sekretariat" },
  M028: { endpoint: "/api/renja",  label: "Renja",                   unit: "Sekretariat" },
  M029: { endpoint: "/api/rkpd",  label: "RKPD",                    unit: "Sekretariat" },
  M030: { endpoint: "/api/sek-lks",  label: "LAKIP",                   unit: "Sekretariat" },
  M031: { endpoint: "/api/sek-lkt",  label: "Monitoring & Evaluasi",   unit: "Sekretariat" },

  // ── Bidang Ketersediaan M032–M041 ─────────────────────────────────────────
  M032: { endpoint: "/api/komoditas",  label: "Data Komoditas Pangan",  unit: "Ketersediaan" },
  M033: { endpoint: "/api/bkt-pgd",   label: "Data Produksi Pangan",   unit: "Ketersediaan" },
  M034: { endpoint: "/api/stok",       label: "Stok Pangan Gudang",     unit: "Ketersediaan" },
  M035: { endpoint: "/api/bkt-bmb",   label: "Neraca Pangan Daerah",   unit: "Ketersediaan" },
  M036: { endpoint: "/api/bkt-krw",   label: "Peta Kerawanan Pangan",  unit: "Ketersediaan" },
  M037: { endpoint: "/api/bkt-mev",   label: "Indeks Ketahanan Pangan", unit: "Ketersediaan" },
  M038: { endpoint: "/api/bkt-mev",   label: "Early Warning Ketersediaan", unit: "Ketersediaan" },
  M039: { endpoint: "/api/bkt-pgd",   label: "Data Bencana Dampak Pangan", unit: "Ketersediaan" },
  M040: { endpoint: "/api/bkt-fsl",   label: "Luas Panen",             unit: "Ketersediaan" },
  M041: { endpoint: "/api/bkt-kbj",   label: "Produktivitas Pangan",   unit: "Ketersediaan" },

  // ── Bidang Distribusi M042–M055 ───────────────────────────────────────────
  M042: { endpoint: "/api/bds-mon",   label: "Data Pasar",             unit: "Distribusi" },
  M043: { endpoint: "/api/bds-hrg",   label: "Harga Pangan Harian",    unit: "Distribusi" },
  M044: { endpoint: "/api/bds-evl",   label: "Inflasi Pangan Bulanan", unit: "Distribusi" },
  M045: { endpoint: "/api/bds-evl",   label: "Inflasi per Komoditas",  unit: "Distribusi" },
  M046: { endpoint: "/api/bds-evl",   label: "Dashboard Inflasi TPID", unit: "Distribusi" },
  M047: { endpoint: "/api/bds-mon",   label: "Distribusi Pangan",      unit: "Distribusi" },
  M048: { endpoint: "/api/bds-cpd",   label: "CPPD",                   unit: "Distribusi" },
  M049: { endpoint: "/api/bds-cpd",   label: "CBP BULOG",              unit: "Distribusi" },
  M050: { endpoint: "/api/bds-cpd",   label: "Pelepasan Cadangan",     unit: "Distribusi" },
  M051: { endpoint: "/api/bds-lap",   label: "Operasi Pasar",          unit: "Distribusi" },
  M052: { endpoint: "/api/bds-lap",   label: "Gerakan Pangan Murah",   unit: "Distribusi" },
  M053: { endpoint: "/api/bds-lap",   label: "Bantuan Pangan Pemerintah", unit: "Distribusi" },
  M054: { endpoint: "/api/bds-kbj",   label: "Rapat TPID",             unit: "Distribusi" },
  M055: { endpoint: "/api/bds-bmb",   label: "Analisis Pasokan",       unit: "Distribusi" },

  // ── Bidang Konsumsi M056–M067 ─────────────────────────────────────────────
  M056: { endpoint: "/api/bks-kbj",   label: "Data Konsumsi Pangan",   unit: "Konsumsi" },
  M057: { endpoint: "/api/bks-kbj",   label: "PPH (Pola Pangan Harapan)", unit: "Konsumsi" },
  M058: { endpoint: "/api/bks-lap",   label: "Data SPPG Penerima",     unit: "Konsumsi" },
  M059: { endpoint: "/api/bks-lap",   label: "SPPG Distribusi",        unit: "Konsumsi" },
  M060: { endpoint: "/api/bks-kbj",   label: "Program Makan Bergizi Gratis", unit: "Konsumsi" },
  M061: { endpoint: "/api/bks-dvr",   label: "Program B2SA",           unit: "Konsumsi" },
  M062: { endpoint: "/api/bks-dvr",   label: "Diversifikasi Pangan",   unit: "Konsumsi" },
  M063: { endpoint: "/api/bks-kmn",   label: "Inspeksi Keamanan Pangan", unit: "Konsumsi" },
  M064: { endpoint: "/api/bks-kmn",   label: "Data Keracunan Pangan",  unit: "Konsumsi" },
  M065: { endpoint: "/api/bks-lap",   label: "Edukasi Konsumsi Pangan", unit: "Konsumsi" },
  M066: { endpoint: "/api/bks-lap",   label: "Data UMKM Pangan",       unit: "Konsumsi" },
  M067: { endpoint: "/api/bks-lap",   label: "Pembinaan UMKM",         unit: "Konsumsi" },

  // ── UPTD Balai PMKP M068–M080 ─────────────────────────────────────────────
  M068: { endpoint: "/api/upt-ins",   label: "Sertifikasi Prima",       unit: "UPTD" },
  M069: { endpoint: "/api/upt-ins",   label: "Sertifikasi GMP/NKV",    unit: "UPTD" },
  M070: { endpoint: "/api/upt-ins",   label: "Sertifikasi GFP",        unit: "UPTD" },
  M071: { endpoint: "/api/upt-ins",   label: "Sertifikasi GHP",        unit: "UPTD" },
  M072: { endpoint: "/api/upt-ins",   label: "Audit Pangan",           unit: "UPTD" },
  M073: { endpoint: "/api/upt-ins",   label: "Registrasi Produk",      unit: "UPTD" },
  M074: { endpoint: "/api/upt-mtu",   label: "Uji Laboratorium",       unit: "UPTD" },
  M075: { endpoint: "/api/upt-mtu",   label: "Hasil Uji Kimia",        unit: "UPTD" },
  M076: { endpoint: "/api/upt-mtu",   label: "Hasil Uji Mikrobiologi", unit: "UPTD" },
  M077: { endpoint: "/api/upt-mtu",   label: "Hasil Uji Fisik",        unit: "UPTD" },
  M078: { endpoint: "/api/upt-tkn",   label: "Pengawasan Pangan Berisiko", unit: "UPTD" },
  M079: { endpoint: "/api/upt-tkn",   label: "Sampling Pangan",        unit: "UPTD" },
  M080: { endpoint: "/api/upt-mtu",   label: "Database UMKM Tersertifikasi", unit: "UPTD" },

  // ── Layanan Publik M081–M084 ───────────────────────────────────────────────
  M081: { endpoint: "/api/layanan",   label: "Laporan Masyarakat",     unit: "Publik" },
  M082: { endpoint: "/api/data",      label: "Portal Data Terbuka",    unit: "Publik" },
  M083: { endpoint: "/api/data",      label: "Dataset Publik",         unit: "Publik" },
  M084: { endpoint: "/api/layanan",   label: "Request Data Peneliti",  unit: "Publik" },

  // ── Layanan per sub-domain (SEK-*, BKT-*, BDS-*, BKS-*, UPT-*) ───────────
  "SEK-ADM": { endpoint: "/api/sek-adm", label: "Administrasi Umum",      unit: "Sekretariat" },
  "SEK-KEP": { endpoint: "/api/sek-kep", label: "Layanan Kepegawaian",    unit: "Sekretariat" },
  "SEK-HUM": { endpoint: "/api/sek-hum", label: "Humas & Persuratan",     unit: "Sekretariat" },
  "SEK-AST": { endpoint: "/api/sek-ast", label: "Aset & Perlengkapan",    unit: "Sekretariat" },
  "SEK-KEU": { endpoint: "/api/sek-keu", label: "Keuangan",               unit: "Sekretariat" },
  "SEK-LUP": { endpoint: "/api/sek-lup", label: "SPPD / Perjalanan",      unit: "Sekretariat" },
  "SEK-REN": { endpoint: "/api/sek-ren", label: "Perencanaan",            unit: "Sekretariat" },
  "SEK-LKS": { endpoint: "/api/sek-lks", label: "Pelaporan LAKIP",        unit: "Sekretariat" },
  "SEK-LKT": { endpoint: "/api/sek-lkt", label: "Monitoring & Evaluasi",  unit: "Sekretariat" },
  "SEK-KBJ": { endpoint: "/api/sek-kbj", label: "Kebijakan",              unit: "Sekretariat" },
  "SEK-LDS": { endpoint: "/api/sek-lds", label: "Layanan Dasar",          unit: "Sekretariat" },
  "SEK-RMH": { endpoint: "/api/sek-rmh", label: "Rumah Tangga",           unit: "Sekretariat" },
  "BKT-PGD": { endpoint: "/api/bkt-pgd", label: "Produksi & Gabah",       unit: "Ketersediaan" },
  "BKT-FSL": { endpoint: "/api/bkt-fsl", label: "Fungsional & Lahan",     unit: "Ketersediaan" },
  "BKT-BMB": { endpoint: "/api/bkt-bmb", label: "Neraca Pangan",          unit: "Ketersediaan" },
  "BKT-KRW": { endpoint: "/api/bkt-krw", label: "Kerawanan Pangan",       unit: "Ketersediaan" },
  "BKT-MEV": { endpoint: "/api/bkt-mev", label: "Monev Ketersediaan",     unit: "Ketersediaan" },
  "BKT-KBJ": { endpoint: "/api/bkt-kbj", label: "Kebijakan Ketersediaan", unit: "Ketersediaan" },
  "BDS-HRG": { endpoint: "/api/bds-hrg", label: "Harga Pangan",           unit: "Distribusi" },
  "BDS-EVL": { endpoint: "/api/bds-evl", label: "Evaluasi & Inflasi",     unit: "Distribusi" },
  "BDS-MON": { endpoint: "/api/bds-mon", label: "Monitoring Distribusi",  unit: "Distribusi" },
  "BDS-CPD": { endpoint: "/api/bds-cpd", label: "Cadangan Pangan Daerah", unit: "Distribusi" },
  "BDS-LAP": { endpoint: "/api/bds-lap", label: "Laporan Distribusi",     unit: "Distribusi" },
  "BDS-KBJ": { endpoint: "/api/bds-kbj", label: "Kebijakan Distribusi",   unit: "Distribusi" },
  "BDS-BMB": { endpoint: "/api/bds-bmb", label: "Analisis Pasokan",       unit: "Distribusi" },
  "BKS-KBJ": { endpoint: "/api/bks-kbj", label: "Kebijakan Konsumsi",     unit: "Konsumsi" },
  "BKS-DVR": { endpoint: "/api/bks-dvr", label: "Diversifikasi",          unit: "Konsumsi" },
  "BKS-EVL": { endpoint: "/api/bks-evl", label: "Evaluasi Konsumsi",      unit: "Konsumsi" },
  "BKS-KMN": { endpoint: "/api/bks-kmn", label: "Keamanan Pangan",        unit: "Konsumsi" },
  "BKS-LAP": { endpoint: "/api/bks-lap", label: "Laporan Konsumsi",       unit: "Konsumsi" },
  "BKS-BMB": { endpoint: "/api/bks-bmb", label: "Neraca Konsumsi",        unit: "Konsumsi" },
  "UPT-INS": { endpoint: "/api/upt-ins", label: "Inspeksi & Sertifikasi", unit: "UPTD" },
  "UPT-MTU": { endpoint: "/api/upt-mtu", label: "Mutu & Lab",             unit: "UPTD" },
  "UPT-TKN": { endpoint: "/api/upt-tkn", label: "Teknis UPTD",            unit: "UPTD" },
  "UPT-ADM": { endpoint: "/api/upt-adm", label: "Administrasi UPTD",      unit: "UPTD" },
  "UPT-AST": { endpoint: "/api/upt-ast", label: "Aset UPTD",              unit: "UPTD" },
  "UPT-KEP": { endpoint: "/api/upt-kep", label: "Kepegawaian UPTD",       unit: "UPTD" },
  "UPT-KEU": { endpoint: "/api/upt-keu", label: "Keuangan UPTD",          unit: "UPTD" },
};

// Daftar semua modul yang tersedia untuk render
export const ALL_MODULES = Object.entries(MODUL_API_MAP).map(([id, meta]) => ({
  id, ...meta,
}));
