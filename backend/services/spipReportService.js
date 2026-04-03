import fs from "fs";
import path from "path";
import csv from "csv-parser";
import ExcelJS from "exceljs";

const SPIP_DIR = path.resolve(process.cwd(), "master-data", "SPIP");

async function readCsvRows(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return await new Promise((resolve, reject) => {
    const out = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => out.push(row))
      .on("end", () => resolve(out))
      .on("error", reject);
  });
}

function parsePeriod({ granularity, date, year, month }) {
  const g = String(granularity || "year").toLowerCase();
  const safeG = ["day", "month", "year"].includes(g) ? g : "year";
  const d = date ? String(date) : null;
  const y =
    year != null && year !== "" ? parseInt(String(year), 10) : undefined;
  const m =
    month != null && month !== "" ? parseInt(String(month), 10) : undefined;
  return { granularity: safeG, date: d, year: Number.isFinite(y) ? y : null, month: Number.isFinite(m) ? m : null };
}

function filterRowsByPeriod(rows, period) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const y = period?.year;
  if (!y) return rows;
  const yearFields = [
    "tahun",
    "periode_penerapan_tahun",
    "periode_tahun",
    "periode_year",
  ];
  return rows.filter((r) => {
    for (const f of yearFields) {
      const v = r?.[f];
      if (v == null || v === "") continue;
      const n = parseInt(String(v), 10);
      if (Number.isFinite(n) && n === y) return true;
    }
    return false;
  });
}

function autosizeColumns(ws) {
  ws.columns.forEach((col) => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value == null ? "" : String(cell.value);
      max = Math.max(max, Math.min(60, v.length + 2));
    });
    col.width = max;
  });
}

function addSheetFromRows(wb, title, rows) {
  const ws = wb.addWorksheet(title.slice(0, 31));
  if (!rows || rows.length === 0) {
    ws.addRow(["(tidak ada data)"]);
    ws.getRow(1).font = { italic: true, color: { argb: "FF64748B" } };
    return ws;
  }
  const headers = Array.from(
    new Set(
      rows.flatMap((r) =>
        r && typeof r === "object" ? Object.keys(r) : [],
      ),
    ),
  );
  ws.columns = headers.map((h) => ({ header: h, key: h, width: 18 }));
  for (const r of rows) {
    const obj = {};
    for (const h of headers) obj[h] = r?.[h] ?? "";
    ws.addRow(obj);
  }
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  autosizeColumns(ws);
  return ws;
}

export async function buildSpipWorkbook({ granularity, date, year, month } = {}) {
  const period = parsePeriod({ granularity, date, year, month });

  const wb = new ExcelJS.Workbook();
  wb.creator = "SIGAP-MALUT";
  wb.created = new Date();
  wb.modified = new Date();

  const cover = wb.addWorksheet("COVER");
  cover.columns = [
    { header: "kunci", key: "k", width: 24 },
    { header: "nilai", key: "v", width: 80 },
  ];
  cover.addRow({ k: "Laporan", v: "SPIP / Manajemen Risiko (Auto-generated)" });
  cover.addRow({ k: "Periode", v: `${period.granularity}${period.year ? ` ${period.year}` : ""}${period.month ? `-${String(period.month).padStart(2, "0")}` : ""}${period.date ? ` (${period.date})` : ""}` });
  cover.addRow({ k: "Dibuat pada", v: new Date().toISOString() });
  cover.addRow({
    k: "Catatan",
    v: "Laporan ini disusun dari master-data/CSV. Filter tanggal/bulan akan lebih akurat setelah modul SPIP memakai data transaksi (created_at) di database.",
  });
  cover.getRow(1).font = { bold: true };
  cover.views = [{ state: "frozen", ySplit: 1 }];

  const files = [
    ["Konteks", "00_FORM_PENETAPAN_KONTEKS.csv"],
    ["Sasaran", "04_SASARAN_STRATEGIS_PROGRAM.csv"],
    ["Proses Bisnis", "05_PROSES_BISNIS_KEGIATAN.csv"],
    ["Stakeholder", "06_PEMANGKU_KEPENTINGAN.csv"],
    ["Kemungkinan", "01_KRITERIA_KEMUNGKINAN.csv"],
    ["Dampak", "02_KRITERIA_DAMPAK.csv"],
    ["Matriks 5x5", "03_MATRIKS_ANALISIS_RISIKO_5x5.csv"],
    ["Identifikasi", "10_IDENTIFIKASI_RISIKO.csv"],
    ["Analisis", "11_ANALISIS_RISIKO.csv"],
    ["Prioritas", "12_DAFTAR_RISIKO_PRIORITAS.csv"],
    ["Akar Masalah", "13_ANALISIS_AKAR_MASALAH_5WHY.csv"],
    ["RTP", "14_RENCANA_TINDAK_PENGENDALIAN_RTP.csv"],
    ["Pemantauan Kegiatan", "15_PEMANTAUAN_KEGIATAN_PENGENDALIAN.csv"],
    ["Peristiwa Risiko", "16_PEMANTAUAN_PERISTIWA_RISIKO.csv"],
    ["Level Risiko", "17_PEMANTAUAN_LEVEL_RISIKO.csv"],
    ["Usulan Risiko Baru", "18_REVIU_USULAN_RISIKO_BARU.csv"],
    ["RTP Belum Realisasi", "19_RENCANA_PENGENDALIAN_BELUM_TEREALISASI.csv"],
    ["Efektivitas", "20_PEMANTAUAN_EFEKTIVITAS_PENGENDALIAN.csv"],
    ["Katalog Risiko", "22_KATALOG_RISIKO.csv"],
  ];

  for (const [title, fname] of files) {
    const fp = path.join(SPIP_DIR, fname);
    const rows = await readCsvRows(fp);
    const filtered = filterRowsByPeriod(rows, period);
    addSheetFromRows(wb, title, filtered);
  }

  return { workbook: wb, period };
}

