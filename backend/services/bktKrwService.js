import { Op } from "sequelize";

const NUMERIC_FIELDS = [
  "latitude",
  "longitude",
  "skor_kerawanan",
  "indikator_ketersediaan_pangan",
  "indikator_akses_pangan",
  "indikator_pemanfaatan_pangan",
  "indikator_kerawanan_kesehatan",
  "jumlah_penduduk",
  "jumlah_kk",
  "jumlah_kk_miskin",
  "persentase_kemiskinan",
  "stunting_prevalensi",
  "wasting_prevalensi",
  "underweight_prevalensi",
  "stok_pangan",
  "anggaran_kebutuhan",
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

function statusFromPrioritas(prioritas) {
  switch (prioritas) {
    case "Prioritas 1":
      return "Sangat Rawan";
    case "Prioritas 2":
    case "Prioritas 3":
      return "Rawan";
    case "Prioritas 4":
      return "Waspada";
    default:
      return "Aman";
  }
}

export function normalizeBktKrwPayload(rawPayload = {}) {
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

  for (const field of ["tahun", "created_by"]) {
    if (payload[field] !== undefined && payload[field] !== null) {
      payload[field] = Number(payload[field]);
    }
  }

  if (
    payload.persentase_kemiskinan == null &&
    payload.jumlah_kk_miskin != null &&
    payload.jumlah_kk != null &&
    payload.jumlah_kk > 0
  ) {
    payload.persentase_kemiskinan = Number(
      ((payload.jumlah_kk_miskin / payload.jumlah_kk) * 100).toFixed(2),
    );
  }

  if (payload.skor_kerawanan == null) {
    const indicators = [
      payload.indikator_ketersediaan_pangan,
      payload.indikator_akses_pangan,
      payload.indikator_pemanfaatan_pangan,
      payload.indikator_kerawanan_kesehatan,
    ].filter((value) => value != null);

    if (indicators.length > 0) {
      payload.skor_kerawanan = Number(
        (
          indicators.reduce((sum, value) => sum + value, 0) /
          indicators.length
        ).toFixed(2),
      );
    }
  }

  payload.status_ketersediaan =
    payload.status_ketersediaan || statusFromPrioritas(payload.tingkat_kerawanan);

  return payload;
}

export function buildBktKrwWhere(query = {}) {
  const where = {};
  const {
    status,
    jenis_kerawanan,
    tahun,
    kabupaten,
    tingkat_kerawanan,
    status_ketersediaan,
    periode_dari,
    periode_sampai,
    search,
  } = query;

  if (status) where.status = status;
  if (jenis_kerawanan) where.jenis_kerawanan = jenis_kerawanan;
  if (tahun) where.tahun = Number(tahun);
  if (kabupaten) where.kabupaten = kabupaten;
  if (tingkat_kerawanan) where.tingkat_kerawanan = tingkat_kerawanan;
  if (status_ketersediaan) where.status_ketersediaan = status_ketersediaan;

  if (periode_dari || periode_sampai) {
    where.periode = {};
    if (periode_dari) where.periode[Op.gte] = periode_dari;
    if (periode_sampai) where.periode[Op.lte] = periode_sampai;
  }

  if (search) {
    where[Op.or] = [
      { kabupaten: { [Op.like]: `%${search}%` } },
      { kecamatan: { [Op.like]: `%${search}%` } },
      { desa: { [Op.like]: `%${search}%` } },
      { penyebab_kerawanan: { [Op.like]: `%${search}%` } },
      { rencana_aksi: { [Op.like]: `%${search}%` } },
      { instansi_terkait: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}
