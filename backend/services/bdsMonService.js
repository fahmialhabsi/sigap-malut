import { Op } from "sequelize";

const NUMERIC_FIELDS = [
  "komoditas_id",
  "tahun",
  "bulan",
  "volume_distribusi",
  "frekuensi_distribusi",
  "pasar_id",
  "stok_pasar",
  "stok_normal",
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

function deriveStatusStok(stokPasar, stokNormal, existingStatus) {
  if (["Surplus", "Aman", "Menipis", "Kritis"].includes(existingStatus)) {
    return existingStatus;
  }
  if (stokPasar == null || stokNormal == null || stokNormal <= 0) return "Aman";
  const ratio = stokPasar / stokNormal;
  if (ratio < 0.5) return "Kritis";
  if (ratio < 0.8) return "Menipis";
  if (ratio > 1.2) return "Surplus";
  return "Aman";
}

export function normalizeBdsMonPayload(rawPayload = {}) {
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

  payload.status_stok = deriveStatusStok(
    payload.stok_pasar,
    payload.stok_normal,
    payload.status_stok,
  );

  return payload;
}

export function buildBdsMonWhere(query = {}) {
  const where = {};
  const {
    status,
    jenis_monitoring,
    tahun,
    bulan,
    komoditas_id,
    pasar_id,
    periode_dari,
    periode_sampai,
    search,
  } = query;

  if (status) where.status = status;
  if (jenis_monitoring) where.jenis_monitoring = jenis_monitoring;
  if (tahun) where.tahun = Number(tahun);
  if (bulan) where.bulan = Number(bulan);
  if (komoditas_id) where.komoditas_id = Number(komoditas_id);
  if (pasar_id) where.pasar_id = Number(pasar_id);

  if (periode_dari || periode_sampai) {
    where.periode = {};
    if (periode_dari) where.periode[Op.gte] = periode_dari;
    if (periode_sampai) where.periode[Op.lte] = periode_sampai;
  }

  if (search) {
    where[Op.or] = [
      { nama_komoditas: { [Op.like]: `%${search}%` } },
      { wilayah_asal: { [Op.like]: `%${search}%` } },
      { wilayah_tujuan: { [Op.like]: `%${search}%` } },
      { nama_pasar: { [Op.like]: `%${search}%` } },
      { lokasi_hambatan: { [Op.like]: `%${search}%` } },
      { instansi_koordinasi: { [Op.like]: `%${search}%` } },
      { pelaksana: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}
