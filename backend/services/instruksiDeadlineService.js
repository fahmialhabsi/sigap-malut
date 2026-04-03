import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "../config/instruksiDeadlineMatrix.json");

/** Baca konfigurasi matriks deadline (file kecil, aman dibaca per request). */
export function loadMatrixSync() {
  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return getDefaultMatrix();
  }
}

function getDefaultMatrix() {
  return {
    baseDaysByJenis: {
      instruksi: 7,
      disposisi: 3,
      arahan_strategis: 14,
      minta_laporan: 10,
      tanggap_darurat: 1,
    },
    priorityAdjustDays: { normal: 0, tinggi: -2, mendesak: -4 },
    minimumDays: 1,
    tanggap_darurat_minimumDays: 1,
    tanggap_darurat_ignorePriorityAdjust: true,
  };
}

/**
 * Hitung tanggal deadline (YYYY-MM-DD) dari tanggal acuan + matriks jenis × prioritas.
 */
export function computeDefaultDeadline(jenis, prioritas, fromDate = new Date()) {
  const cfg = loadMatrixSync();
  const j = String(jenis || "instruksi").toLowerCase();
  const p = String(prioritas || "normal").toLowerCase();
  const base = Number(cfg.baseDaysByJenis?.[j] ?? 7);
  let adjust = Number(cfg.priorityAdjustDays?.[p] ?? 0);
  if (j === "tanggap_darurat" && cfg.tanggap_darurat_ignorePriorityAdjust) {
    adjust = 0;
  }
  let days = base + adjust;
  const min =
    j === "tanggap_darurat"
      ? Number(cfg.tanggap_darurat_minimumDays ?? cfg.minimumDays ?? 1)
      : Number(cfg.minimumDays ?? 1);
  if (days < min) days = min;

  const d = new Date(fromDate);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const TITLE_MAX = 120;

/** Judul ringkas dari isi perintah (satu baris pertama, dipotong). */
export function generateJudulFromIsi(isi) {
  const t = String(isi || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!t) return "Instruksi tanpa judul";
  const line = t.split(/\n/)[0].trim();
  if (line.length <= TITLE_MAX) return line;
  return `${line.slice(0, TITLE_MAX - 1)}…`;
}
