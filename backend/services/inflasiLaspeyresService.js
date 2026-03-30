/**
 * Perhitungan indeks & inflasi harian (proxy operasional) dengan struktur Laspeyres-tipe
 * yang konsisten dengan konsep IHK BPS (bobot tetap × relatif harga).
 *
 * BPS mempublikasikan inflasi bulanan resmi dari IHK nasional; angka harian di sini
 * tidak menggantikan publikasi BPS, melainkan indikator monitoring internal.
 */

import { Op, fn, col } from "sequelize";
import HargaPangan from "../models/HargaPangan.js";
import InflasiHarian from "../models/InflasiHarian.js";
import { normalisasiBobot, KOMODITAS_KEY_BOBOT } from "../config/bpsPanganBobot.js";
import { HARGA_PANGAN_STATUS } from "./hargaPanganRepository.js";

/** Jumlah komoditas acuan bobot — penyebut coverage (selaras bpsPanganBobot.js). */
const EXPECTED_KOMODITAS_KEYS = Object.keys(KOMODITAS_KEY_BOBOT);
const EXPECTED_KOMODITAS_COUNT = EXPECTED_KOMODITAS_KEYS.length;

/** ENV INFLASI_MIN_COVERAGE_PERSEN (default 70): minimal % komoditas acuan yang punya p_t & p_0. */
function minCoverageRatio() {
  const p = Number(process.env.INFLASI_MIN_COVERAGE_PERSEN);
  if (Number.isFinite(p) && p > 0 && p <= 100) return p / 100;
  return 0.7;
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function parseYmd(s) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

/** Rata-rata aritmetika harga per komoditas_key pada rentang tanggal inklusif */
async function avgPriceByKey(dateFrom, dateTo) {
  const rows = await HargaPangan.findAll({
    attributes: [
      "komoditas_key",
      [fn("AVG", col("harga_eceran")), "avg_harga"],
    ],
    where: {
      tanggal: { [Op.between]: [dateFrom, dateTo] },
      status: HARGA_PANGAN_STATUS.TERVERIFIKASI,
      komoditas_key: { [Op.ne]: null },
    },
    group: ["komoditas_key"],
    raw: true,
  });
  const map = {};
  for (const r of rows) {
    if (!r.komoditas_key) continue;
    map[r.komoditas_key] = Number(r.avg_harga);
  }
  return map;
}

/**
 * Harga acuan p_k,0: rata-rata 7 hari pertama bulan untuk bulan yang berisi `tanggal`,
 * kecuali jika tanggal jatuh di 7 hari pertama — gunakan rata-rata 7 hari terakhir bulan sebelumnya.
 */
async function hargaAcuanBulan(tanggalStr) {
  const d = parseYmd(tanggalStr);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();

  let from;
  let to;
  if (day <= 7) {
    const prevLast = new Date(Date.UTC(y, m, 0));
    to = ymd(prevLast);
    const startPrev = new Date(Date.UTC(y, m - 1, Math.max(1, prevLast.getUTCDate() - 6)));
    from = ymd(startPrev);
  } else {
    from = ymd(new Date(Date.UTC(y, m, 1)));
    to = ymd(new Date(Date.UTC(y, m, 7)));
  }

  return avgPriceByKey(from, to);
}

async function hargaHarian(tanggalStr) {
  return avgPriceByKey(tanggalStr, tanggalStr);
}

/**
 * Hitung dan upsert satu baris inflasi_harian untuk `tanggalStr` (YYYY-MM-DD).
 */
export async function computeAndPersistInflasiHarian(tanggalStr) {
  const pT = await hargaHarian(tanggalStr);
  const p0 = await hargaAcuanBulan(tanggalStr);

  const keysWithBoth = Object.keys(pT).filter(
    (k) => pT[k] != null && p0[k] != null && p0[k] > 0,
  );

  const coverageRatio =
    EXPECTED_KOMODITAS_COUNT > 0 ? keysWithBoth.length / EXPECTED_KOMODITAS_COUNT : 0;
  const minCov = minCoverageRatio();

  if (keysWithBoth.length > 0 && coverageRatio < minCov) {
    console.warn(
      `[inflasi] Skip persist ${tanggalStr}: coverage komoditas ${(coverageRatio * 100).toFixed(1)}% < ${(minCov * 100).toFixed(0)}% (matched ${keysWithBoth.length}/${EXPECTED_KOMODITAS_COUNT})`,
    );
    return {
      skipped: true,
      tanggal: tanggalStr,
      reason: "coverage_di_bawah_threshold",
      coverage_komoditas_persen: coverageRatio * 100,
      matched_komoditas: keysWithBoth.length,
      expected_komoditas: EXPECTED_KOMODITAS_COUNT,
    };
  }

  const wEff = normalisasiBobot(new Set(keysWithBoth));
  let indeks = null;
  let detailKomoditas = {};
  if (keysWithBoth.length > 0) {
    let sum = 0;
    for (const k of keysWithBoth) {
      const rel = pT[k] / p0[k];
      sum += wEff[k] * rel;
      detailKomoditas[k] = { p_t: pT[k], p_0: p0[k], w: wEff[k], relatif_harga: rel };
    }
    indeks = 100 * sum;
  }

  const prevDay = new Date(parseYmd(tanggalStr));
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);
  const prevStr = ymd(prevDay);

  const prevRow = await InflasiHarian.findOne({ where: { tanggal: prevStr } });
  let inflasi_dod_persen = null;
  if (indeks != null && prevRow?.indeks_laspeyres != null) {
    const ip = Number(prevRow.indeks_laspeyres);
    if (ip > 0) inflasi_dod_persen = (indeks / ip - 1) * 100;
  }

  const d = parseYmd(tanggalStr);
  const startMonth = ymd(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
  const startRow = await InflasiHarian.findOne({ where: { tanggal: startMonth } });
  let inflasi_mtd_persen = null;
  if (indeks != null && startRow?.indeks_laspeyres != null) {
    const is = Number(startRow.indeks_laspeyres);
    if (is > 0) inflasi_mtd_persen = (indeks / is - 1) * 100;
  }

  const yoyDate = new Date(d);
  yoyDate.setUTCFullYear(yoyDate.getUTCFullYear() - 1);
  const yoyStr = ymd(yoyDate);
  const yoyRow = await InflasiHarian.findOne({ where: { tanggal: yoyStr } });
  let inflasi_yoy_proksi_persen = null;
  if (indeks != null && yoyRow?.indeks_laspeyres != null) {
    const iy = Number(yoyRow.indeks_laspeyres);
    if (iy > 0) inflasi_yoy_proksi_persen = (indeks / iy - 1) * 100;
  }

  const jumlah_baris = await HargaPangan.count({
    where: { tanggal: tanggalStr, status: HARGA_PANGAN_STATUS.TERVERIFIKASI },
  });

  const metodologi_ringkas =
    "Indeks Laspeyres-tipe I=100*Σ w_k*(p_k,t/p_k,0); w_k bobot konsumsi pangan pokok (konfigurasi, bukan publikasi IHK penuh BPS). " +
    "p_k,0 = rata-rata harga terverifikasi 7 hari awal bulan (atau 7 hari akhir bulan sebelumnya jika t ≤ 7). " +
    "Inflasi resmi bulanan mengacu metodologi BPS (IHK nasional).";

  const detail_perhitungan = {
    tanggal: tanggalStr,
    p_t: pT,
    p_0: p0,
    komoditas_detail: detailKomoditas,
    bobot_dipakai: wEff,
    /** Transparansi audit: hanya status terverifikasi, ambang coverage, daftar acuan. */
    audit: {
      hanya_status_terverifikasi: true,
      expected_komoditas_keys: EXPECTED_KOMODITAS_KEYS,
      matched_keys: keysWithBoth,
      coverage_komoditas_persen: Number((coverageRatio * 100).toFixed(2)),
      ambang_minimum_coverage_persen: Number((minCov * 100).toFixed(2)),
    },
  };

  if (indeks == null) {
    console.warn(`[inflasi] Skip ${tanggalStr}: tidak_cukup_data_terverifikasi (pasangan p_t & p_0)`);
    return {
      skipped: true,
      tanggal: tanggalStr,
      reason: "tidak_cukup_data_terverifikasi",
    };
  }

  const coveragePersenStored = Number((coverageRatio * 100).toFixed(2));

  const payload = {
    tanggal: tanggalStr,
    indeks_laspeyres: indeks,
    inflasi_dod_persen,
    inflasi_mtd_persen,
    inflasi_yoy_proksi_persen,
    jumlah_baris_agregasi: jumlah_baris,
    jumlah_komoditas: keysWithBoth.length,
    coverage_komoditas_persen: coveragePersenStored,
    metodologi_ringkas,
    detail_perhitungan,
  };

  const existing = await InflasiHarian.findOne({ where: { tanggal: tanggalStr } });
  let created = false;
  if (existing) {
    await existing.update(payload);
  } else {
    await InflasiHarian.create(payload);
    created = true;
  }

  return {
    skipped: false,
    created,
    tanggal: tanggalStr,
    indeks_laspeyres: indeks,
    inflasi_dod_persen,
    inflasi_mtd_persen,
    inflasi_yoy_proksi_persen,
    coverage_komoditas_persen: coveragePersenStored,
  };
}

export { hargaAcuanBulan, hargaHarian };
