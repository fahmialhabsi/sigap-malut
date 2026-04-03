import { Op } from "sequelize";

const NUMERIC_FIELDS = ["tahun", "created_by"];

const LAYANAN_BY_JENIS = {
  "Kebijakan Distribusi": "LY077",
  "Peta Distribusi": "LY078",
  "Penetapan Jalur": "LY079",
  Sinkronisasi: "LY080",
  "Pedoman Teknis": "LY081",
};

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

export function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeTextList(item))
      .filter(Boolean);
  }

  if (value === null || value === undefined) return [];

  return String(value)
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNullableJsonArray(value) {
  const normalized = normalizeTextList(value);
  return normalized.length > 0 ? normalized : null;
}

function deriveJenisData(payload) {
  if (payload.jenis_data) return payload.jenis_data;

  if (
    payload.titik_distribusi ||
    payload.jalur_distribusi_utama ||
    payload.jalur_distribusi_alternatif ||
    payload.wilayah_distribusi
  ) {
    return "Sarpras Distribusi";
  }

  if (
    payload.stakeholder_terlibat ||
    payload.mekanisme_distribusi ||
    payload.hasil_sinkronisasi ||
    payload.koordinasi_dengan
  ) {
    return "Kelembagaan Distribusi";
  }

  if (payload.pedoman_teknis || payload.sop_distribusi) {
    return "Pedoman Distribusi";
  }

  return "Kebijakan Distribusi";
}

export function normalizeBdsKbjPayload(rawPayload = {}) {
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

  if (Object.prototype.hasOwnProperty.call(payload, "komoditas_distribusi")) {
    payload.komoditas_distribusi = toNullableJsonArray(
      payload.komoditas_distribusi,
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "file_lampiran")) {
    payload.file_lampiran = toNullableJsonArray(payload.file_lampiran);
  }

  if (!payload.layanan_id && payload.jenis_kebijakan) {
    payload.layanan_id = LAYANAN_BY_JENIS[payload.jenis_kebijakan] || null;
  }

  payload.jenis_data = deriveJenisData(payload);

  return payload;
}

export function buildBdsKbjWhere(query = {}) {
  const where = {};
  const { status, jenis_kebijakan, layanan_id, tahun, jenis_data, search } =
    query;

  if (status) where.status = status;
  if (jenis_kebijakan) where.jenis_kebijakan = jenis_kebijakan;
  if (layanan_id) where.layanan_id = layanan_id;
  if (jenis_data) where.jenis_data = jenis_data;
  if (tahun) where.tahun = Number(tahun);

  if (search) {
    where[Op.or] = [
      { judul_kebijakan: { [Op.like]: `%${search}%` } },
      { nomor_dokumen: { [Op.like]: `%${search}%` } },
      { wilayah_distribusi: { [Op.like]: `%${search}%` } },
      { jalur_distribusi_utama: { [Op.like]: `%${search}%` } },
      { jalur_distribusi_alternatif: { [Op.like]: `%${search}%` } },
      { titik_distribusi: { [Op.like]: `%${search}%` } },
      { stakeholder_terlibat: { [Op.like]: `%${search}%` } },
      { koordinasi_dengan: { [Op.like]: `%${search}%` } },
      { pelaksana: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}

export function buildSarprasKelembagaanSummary(rows = []) {
  const komoditas = new Set();
  const wilayah = new Set();
  const titikDistribusi = new Set();
  const jalurUtama = new Set();
  const jalurAlternatif = new Set();
  const stakeholder = new Set();
  const mekanisme = new Set();
  const sinkronisasi = new Set();

  let dokumenSarpras = 0;
  let dokumenKelembagaan = 0;
  let dokumenPedoman = 0;
  let dokumenPeta = 0;

  for (const row of rows) {
    normalizeTextList(row?.komoditas_distribusi).forEach((item) =>
      komoditas.add(item),
    );
    normalizeTextList(row?.wilayah_distribusi).forEach((item) =>
      wilayah.add(item),
    );
    normalizeTextList(row?.titik_distribusi).forEach((item) =>
      titikDistribusi.add(item),
    );
    normalizeTextList(row?.jalur_distribusi_utama).forEach((item) =>
      jalurUtama.add(item),
    );
    normalizeTextList(row?.jalur_distribusi_alternatif).forEach((item) =>
      jalurAlternatif.add(item),
    );
    normalizeTextList(row?.stakeholder_terlibat).forEach((item) =>
      stakeholder.add(item),
    );
    normalizeTextList(row?.koordinasi_dengan).forEach((item) =>
      stakeholder.add(item),
    );
    normalizeTextList(row?.mekanisme_distribusi).forEach((item) =>
      mekanisme.add(item),
    );
    normalizeTextList(row?.hasil_sinkronisasi).forEach((item) =>
      sinkronisasi.add(item),
    );

    if (
      row?.titik_distribusi ||
      row?.jalur_distribusi_utama ||
      row?.jalur_distribusi_alternatif ||
      row?.wilayah_distribusi
    ) {
      dokumenSarpras += 1;
    }

    if (
      row?.stakeholder_terlibat ||
      row?.mekanisme_distribusi ||
      row?.hasil_sinkronisasi ||
      row?.koordinasi_dengan
    ) {
      dokumenKelembagaan += 1;
    }

    if (row?.pedoman_teknis || row?.sop_distribusi) {
      dokumenPedoman += 1;
    }

    if (
      row?.jenis_kebijakan === "Peta Distribusi" ||
      row?.jenis_kebijakan === "Penetapan Jalur"
    ) {
      dokumenPeta += 1;
    }
  }

  return {
    total_dokumen: rows.length,
    dokumen_sarpras: dokumenSarpras,
    dokumen_kelembagaan: dokumenKelembagaan,
    dokumen_pedoman: dokumenPedoman,
    dokumen_peta: dokumenPeta,
    komoditas: Array.from(komoditas),
    wilayah_cakupan: Array.from(wilayah),
    titik_distribusi: Array.from(titikDistribusi),
    jalur_utama: Array.from(jalurUtama),
    jalur_alternatif: Array.from(jalurAlternatif),
    stakeholder: Array.from(stakeholder),
    mekanisme_distribusi: Array.from(mekanisme),
    hasil_sinkronisasi: Array.from(sinkronisasi),
  };
}
