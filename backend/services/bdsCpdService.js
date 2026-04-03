import { Op } from "sequelize";

const NUMERIC_FIELDS = [
  "kebutuhan_cppd",
  "target_stok",
  "kapasitas_gudang",
  "rencana_pengadaan",
  "volume_pengadaan",
  "harga_satuan",
  "total_nilai",
  "stok_awal_bulan",
  "penerimaan_bulan_ini",
  "penyaluran_bulan_ini",
  "stok_akhir_bulan",
  "persentase_terhadap_target",
  "suhu_gudang",
  "kelembaban_gudang",
  "volume_penyaluran",
  "jumlah_penerima_manfaat",
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

function toStatusStok(rawStatus, percent) {
  if (rawStatus === "Kritis" || rawStatus === "Menipis" || rawStatus === "Aman") {
    return rawStatus;
  }
  if (percent === null || percent === undefined) return "Aman";
  if (percent < 50) return "Kritis";
  if (percent < 80) return "Menipis";
  return "Aman";
}

function toUiStatus(statusStok, percent) {
  if (statusStok === "Kritis") return "kritis";
  if (statusStok === "Menipis") return "waspada";
  if (percent !== null && percent !== undefined) {
    if (percent < 50) return "kritis";
    if (percent < 80) return "waspada";
  }
  return "aman";
}

function recordTimestamp(record) {
  return (
    record?.updated_at ||
    record?.created_at ||
    record?.tanggal_penyaluran ||
    record?.tanggal_pengadaan ||
    record?.periode ||
    null
  );
}

function shouldReplaceSummaryRecord(current, candidate) {
  if (!current) return true;
  const currentTime = new Date(recordTimestamp(current) || 0).getTime();
  const candidateTime = new Date(recordTimestamp(candidate) || 0).getTime();
  return candidateTime >= currentTime;
}

export function normalizeBdsCpdPayload(rawPayload = {}) {
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

  if (payload.komoditas_id !== undefined) {
    payload.komoditas_id =
      payload.komoditas_id === null ? null : Number(payload.komoditas_id);
  }
  if (payload.tahun !== undefined && payload.tahun !== null) {
    payload.tahun = Number(payload.tahun);
  }
  if (payload.bulan !== undefined && payload.bulan !== null) {
    payload.bulan = Number(payload.bulan);
  }
  if (payload.created_by !== undefined && payload.created_by !== null) {
    payload.created_by = Number(payload.created_by);
  }

  if (payload.target_stok == null && payload.kebutuhan_cppd != null) {
    payload.target_stok = payload.kebutuhan_cppd;
  }

  if (payload.penerimaan_bulan_ini == null && payload.volume_pengadaan != null) {
    payload.penerimaan_bulan_ini = payload.volume_pengadaan;
  }

  if (payload.penyaluran_bulan_ini == null && payload.volume_penyaluran != null) {
    payload.penyaluran_bulan_ini = payload.volume_penyaluran;
  }

  if (
    payload.stok_akhir_bulan == null &&
    (payload.stok_awal_bulan != null ||
      payload.penerimaan_bulan_ini != null ||
      payload.penyaluran_bulan_ini != null)
  ) {
    payload.stok_akhir_bulan =
      (payload.stok_awal_bulan ?? 0) +
      (payload.penerimaan_bulan_ini ?? 0) -
      (payload.penyaluran_bulan_ini ?? 0);
  }

  if (
    payload.persentase_terhadap_target == null &&
    payload.target_stok != null &&
    payload.target_stok > 0 &&
    payload.stok_akhir_bulan != null
  ) {
    payload.persentase_terhadap_target = Number(
      ((payload.stok_akhir_bulan / payload.target_stok) * 100).toFixed(2),
    );
  }

  payload.status_stok = toStatusStok(
    payload.status_stok,
    payload.persentase_terhadap_target,
  );

  return payload;
}

export function buildBdsCpdWhere(query = {}) {
  const where = {};
  const {
    status,
    jenis_layanan_cppd,
    tahun,
    bulan,
    komoditas_id,
    periode_dari,
    periode_sampai,
    search,
  } = query;

  if (status) where.status = status;
  if (jenis_layanan_cppd) where.jenis_layanan_cppd = jenis_layanan_cppd;
  if (tahun) where.tahun = Number(tahun);
  if (bulan) where.bulan = Number(bulan);
  if (komoditas_id) where.komoditas_id = Number(komoditas_id);

  if (periode_dari || periode_sampai) {
    where.periode = {};
    if (periode_dari) where.periode[Op.gte] = periode_dari;
    if (periode_sampai) where.periode[Op.lte] = periode_sampai;
  }

  if (search) {
    where[Op.or] = [
      { nama_komoditas: { [Op.like]: `%${search}%` } },
      { lokasi_penyimpanan: { [Op.like]: `%${search}%` } },
      { wilayah_penyaluran: { [Op.like]: `%${search}%` } },
      { penyedia: { [Op.like]: `%${search}%` } },
      { pelaksana: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}

export function buildCppdStatusSummary(rows = []) {
  const latestByCommodity = new Map();

  for (const row of rows) {
    const komoditasNama =
      row?.nama_komoditas || row?.komoditas?.nama || `Komoditas ${row?.komoditas_id || row?.id}`;
    const key = row?.komoditas_id || komoditasNama;
    const current = latestByCommodity.get(key);

    if (shouldReplaceSummaryRecord(current, row)) {
      latestByCommodity.set(key, row);
    }
  }

  const stok_cadangan = Array.from(latestByCommodity.values())
    .map((row) => {
      const target = toNullableNumber(row.target_stok);
      const stok = toNullableNumber(
        row.stok_akhir_bulan ?? row.stok_awal_bulan ?? row.penerimaan_bulan_ini,
      );
      const percent =
        toNullableNumber(row.persentase_terhadap_target) ??
        (target && stok != null ? Number(((stok / target) * 100).toFixed(2)) : null);
      const status = toUiStatus(row.status_stok, percent);

      return {
        id: row.id,
        komoditas: row.nama_komoditas || row.komoditas?.nama || `Komoditas ${row.komoditas_id || row.id}`,
        stok_ton: stok,
        target_ton: target,
        persen_tercapai: percent,
        lokasi_gudang: row.lokasi_penyimpanan || null,
        status,
        periode: row.periode,
        jenis_layanan_cppd: row.jenis_layanan_cppd,
      };
    })
    .sort((a, b) => {
      const pa = a.persen_tercapai ?? -1;
      const pb = b.persen_tercapai ?? -1;
      return pa - pb;
    });

  const status_keseluruhan = stok_cadangan.some((row) => row.status === "kritis")
    ? "kritis"
    : stok_cadangan.some((row) => row.status === "waspada")
      ? "waspada"
      : stok_cadangan.length > 0
        ? "aman"
        : "tidak_tersedia";

  const update_terakhir =
    rows
      .map((row) => recordTimestamp(row))
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || null;

  return {
    status_keseluruhan,
    update_terakhir,
    stok_cadangan,
    catatan:
      stok_cadangan.length > 0
        ? "Data CPPD berdasarkan record operasional terbaru per komoditas."
        : "Belum ada data CPPD operasional yang dapat diringkas.",
  };
}
