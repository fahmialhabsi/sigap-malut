import { Op } from "sequelize";

const NUMERIC_FIELDS = [
  "tahun",
  "bulan",
  "triwulan",
  "semester",
  "inflasi_pangan",
  "target_inflasi",
  "volume_distribusi_total",
  "stok_cppd",
  "operasi_pasar_dilakukan",
  "rapat_tpid_dilakukan",
  "anggaran_program",
  "realisasi_anggaran",
  "persentase_serapan",
  "created_by",
];

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const normalized =
    typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableString(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableJsonArray(value) {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => toNullableString(item))
      .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "string") {
    const normalized = value
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  return null;
}

export function deriveStatusInflasi(inflasiPangan, targetInflasi = 2.5) {
  const inflasi = toNullableNumber(inflasiPangan);
  const target = toNullableNumber(targetInflasi) ?? 2.5;

  if (inflasi === null) return null;
  if (inflasi > target + 0.5) return "Alert";
  if (inflasi > target) return "Warning";
  return "On Target";
}

export function normalizeBdsLapPayload(rawPayload = {}) {
  const payload = { ...rawPayload };

  for (const field of NUMERIC_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      payload[field] = toNullableNumber(payload[field]);
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      payload[key] = toNullableString(value);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "file_data_pendukung")) {
    payload.file_data_pendukung = toNullableJsonArray(payload.file_data_pendukung);
  }

  if (payload.target_inflasi == null) {
    payload.target_inflasi = 2.5;
  }

  if (
    payload.persentase_serapan == null &&
    payload.anggaran_program != null &&
    payload.anggaran_program > 0 &&
    payload.realisasi_anggaran != null
  ) {
    payload.persentase_serapan = Number(
      ((payload.realisasi_anggaran / payload.anggaran_program) * 100).toFixed(2),
    );
  }

  payload.status_inflasi = deriveStatusInflasi(
    payload.inflasi_pangan,
    payload.target_inflasi,
  );

  if (payload.periode && payload.bulan == null) {
    const parsed = new Date(payload.periode);
    if (!Number.isNaN(parsed.getTime())) {
      payload.bulan = parsed.getUTCMonth() + 1;
    }
  }

  if (payload.periode && payload.tahun == null) {
    const parsed = new Date(payload.periode);
    if (!Number.isNaN(parsed.getTime())) {
      payload.tahun = parsed.getUTCFullYear();
    }
  }

  return payload;
}

export function buildBdsLapWhere(query = {}) {
  const where = {};
  const {
    status,
    tahun,
    bulan,
    triwulan,
    semester,
    periode_dari,
    periode_sampai,
    search,
  } = query;

  if (status) where.status = status;
  if (tahun) where.tahun = Number(tahun);
  if (bulan) where.bulan = Number(bulan);
  if (triwulan) where.triwulan = Number(triwulan);
  if (semester) where.semester = Number(semester);

  if (periode_dari || periode_sampai) {
    where.periode = {};
    if (periode_dari) where.periode[Op.gte] = periode_dari;
    if (periode_sampai) where.periode[Op.lte] = periode_sampai;
  }

  if (search) {
    where[Op.or] = [
      { judul_laporan: { [Op.like]: `%${search}%` } },
      { ringkasan_eksekutif: { [Op.like]: `%${search}%` } },
      { capaian_distribusi: { [Op.like]: `%${search}%` } },
      { permasalahan: { [Op.like]: `%${search}%` } },
      { rekomendasi: { [Op.like]: `%${search}%` } },
      { pelaksana: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}
