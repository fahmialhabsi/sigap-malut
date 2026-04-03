import { Op } from "sequelize";

const NUMERIC_FIELDS = [
  "luas_tanam",
  "luas_panen",
  "produktivitas",
  "produksi_total",
  "target_produksi",
  "persentase_capaian",
  "pasokan_lokal",
  "pasokan_luar_daerah",
  "pasokan_impor",
  "total_pasokan",
  "konsumsi_estimasi",
  "stok_awal",
  "stok_akhir",
  "surplus_defisit",
  "neraca_pangan_ketersediaan",
  "neraca_pangan_penggunaan",
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

function recordTimestamp(record) {
  return record?.updated_at || record?.created_at || record?.periode || null;
}

function shouldReplaceSummaryRecord(current, candidate) {
  if (!current) return true;
  const currentTime = new Date(recordTimestamp(current) || 0).getTime();
  const candidateTime = new Date(recordTimestamp(candidate) || 0).getTime();
  return candidateTime >= currentTime;
}

function deriveStatusKetersediaan(surplusDefisit, konsumsiEstimasi) {
  const surplus = toNullableNumber(surplusDefisit);
  const konsumsi = toNullableNumber(konsumsiEstimasi);

  if (surplus === null) return "Aman";
  if (surplus < 0) {
    if (konsumsi !== null && konsumsi > 0 && surplus > konsumsi * -0.1) {
      return "Menipis";
    }
    return "Defisit";
  }
  if (konsumsi !== null && konsumsi > 0 && surplus >= konsumsi * 0.1) {
    return "Surplus";
  }
  return "Aman";
}

function deriveTingkatKerawanan(statusKetersediaan, validitasData) {
  if (statusKetersediaan === "Defisit") return "Sangat Rawan";
  if (statusKetersediaan === "Menipis") return "Rawan";
  if (validitasData === "Perlu Verifikasi") return "Waspada";
  return "Aman";
}

function deriveEarlyWarningStatus(statusKetersediaan, tingkatKerawanan, validitasData) {
  if (
    statusKetersediaan === "Defisit" ||
    tingkatKerawanan === "Sangat Rawan"
  ) {
    return "Darurat";
  }
  if (statusKetersediaan === "Menipis" || tingkatKerawanan === "Rawan") {
    return "Siaga";
  }
  if (validitasData === "Perlu Verifikasi" || tingkatKerawanan === "Waspada") {
    return "Waspada";
  }
  return "Normal";
}

function pickLatestByKey(rows = [], keySelector) {
  const latest = new Map();
  for (const row of rows) {
    const key = keySelector(row);
    const current = latest.get(key);
    if (shouldReplaceSummaryRecord(current, row)) {
      latest.set(key, row);
    }
  }
  return Array.from(latest.values());
}

function formatPeriode(periode) {
  if (!periode) return null;
  const date = new Date(periode);
  if (Number.isNaN(date.getTime())) return String(periode);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
  });
}

function buildOverallLevel({ alertDarurat, alertSiaga, alertWaspada, rawanKabupaten }) {
  if (alertDarurat > 0 || rawanKabupaten.sangat_rawan > 0) return "kritis";
  if (
    alertSiaga > 0 ||
    rawanKabupaten.rawan > 0 ||
    rawanKabupaten.sangat_rawan > 0
  ) {
    return "waspada";
  }
  if (alertWaspada > 0 || rawanKabupaten.waspada > 0) return "waspada";
  return "aman";
}

export function normalizeBktPgdPayload(rawPayload = {}) {
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

  for (const field of ["komoditas_id", "tahun", "bulan", "created_by"]) {
    if (payload[field] !== undefined && payload[field] !== null) {
      payload[field] = Number(payload[field]);
    }
  }

  if (
    payload.produksi_total == null &&
    payload.luas_panen != null &&
    payload.produktivitas != null
  ) {
    payload.produksi_total = Number(
      (payload.luas_panen * payload.produktivitas).toFixed(2),
    );
  }

  if (
    payload.produktivitas == null &&
    payload.produksi_total != null &&
    payload.luas_panen != null &&
    payload.luas_panen > 0
  ) {
    payload.produktivitas = Number(
      (payload.produksi_total / payload.luas_panen).toFixed(2),
    );
  }

  if (payload.pasokan_lokal == null && payload.produksi_total != null) {
    payload.pasokan_lokal = payload.produksi_total;
  }

  if (
    payload.total_pasokan == null &&
    [
      payload.stok_awal,
      payload.pasokan_lokal,
      payload.pasokan_luar_daerah,
      payload.pasokan_impor,
    ].some((value) => value != null)
  ) {
    payload.total_pasokan =
      (payload.stok_awal ?? 0) +
      (payload.pasokan_lokal ?? 0) +
      (payload.pasokan_luar_daerah ?? 0) +
      (payload.pasokan_impor ?? 0);
  }

  if (
    payload.neraca_pangan_ketersediaan == null &&
    payload.total_pasokan != null
  ) {
    payload.neraca_pangan_ketersediaan = payload.total_pasokan;
  }

  if (
    payload.neraca_pangan_penggunaan == null &&
    payload.konsumsi_estimasi != null
  ) {
    payload.neraca_pangan_penggunaan = payload.konsumsi_estimasi;
  }

  if (
    payload.surplus_defisit == null &&
    payload.neraca_pangan_ketersediaan != null &&
    payload.neraca_pangan_penggunaan != null
  ) {
    payload.surplus_defisit = Number(
      (
        payload.neraca_pangan_ketersediaan -
        payload.neraca_pangan_penggunaan
      ).toFixed(2),
    );
  }

  if (
    payload.stok_akhir == null &&
    payload.neraca_pangan_ketersediaan != null &&
    payload.neraca_pangan_penggunaan != null
  ) {
    payload.stok_akhir = Number(
      (
        payload.neraca_pangan_ketersediaan -
        payload.neraca_pangan_penggunaan
      ).toFixed(2),
    );
  }

  if (
    payload.persentase_capaian == null &&
    payload.target_produksi != null &&
    payload.target_produksi > 0 &&
    payload.produksi_total != null
  ) {
    payload.persentase_capaian = Number(
      ((payload.produksi_total / payload.target_produksi) * 100).toFixed(2),
    );
  }

  payload.status_ketersediaan =
    payload.status_ketersediaan ||
    deriveStatusKetersediaan(payload.surplus_defisit, payload.konsumsi_estimasi);

  payload.tingkat_kerawanan =
    payload.tingkat_kerawanan ||
    deriveTingkatKerawanan(payload.status_ketersediaan, payload.validitas_data);

  payload.early_warning_status =
    payload.early_warning_status ||
    deriveEarlyWarningStatus(
      payload.status_ketersediaan,
      payload.tingkat_kerawanan,
      payload.validitas_data,
    );

  return payload;
}

export function buildBktPgdWhere(query = {}) {
  const where = {};
  const {
    status,
    jenis_pengendalian,
    tahun,
    bulan,
    kabupaten,
    komoditas_id,
    validitas_data,
    early_warning_status,
    status_ketersediaan,
    periode_dari,
    periode_sampai,
    search,
  } = query;

  if (status) where.status = status;
  if (jenis_pengendalian) where.jenis_pengendalian = jenis_pengendalian;
  if (tahun) where.tahun = Number(tahun);
  if (bulan) where.bulan = Number(bulan);
  if (kabupaten) where.kabupaten = kabupaten;
  if (komoditas_id) where.komoditas_id = Number(komoditas_id);
  if (validitas_data) where.validitas_data = validitas_data;
  if (early_warning_status) where.early_warning_status = early_warning_status;
  if (status_ketersediaan) where.status_ketersediaan = status_ketersediaan;

  if (periode_dari || periode_sampai) {
    where.periode = {};
    if (periode_dari) where.periode[Op.gte] = periode_dari;
    if (periode_sampai) where.periode[Op.lte] = periode_sampai;
  }

  if (search) {
    where[Op.or] = [
      { nama_komoditas: { [Op.like]: `%${search}%` } },
      { kabupaten: { [Op.like]: `%${search}%` } },
      { kecamatan: { [Op.like]: `%${search}%` } },
      { sumber_data: { [Op.like]: `%${search}%` } },
      { pelaksana: { [Op.like]: `%${search}%` } },
      { keterangan: { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
}

export function buildKetersediaanSummary(pgdRows = [], krwRows = []) {
  const latestByCommodity = pickLatestByKey(
    pgdRows,
    (row) => row?.komoditas_id || row?.nama_komoditas || row?.id,
  );
  const latestByKabupaten = pickLatestByKey(
    krwRows,
    (row) => row?.kabupaten || row?.id,
  );

  const ewsCounters = latestByCommodity.reduce(
    (acc, row) => {
      const alertLevel = row?.early_warning_status || "Normal";
      if (alertLevel === "Darurat") acc.alertDarurat += 1;
      else if (alertLevel === "Siaga") acc.alertSiaga += 1;
      else if (alertLevel === "Waspada") acc.alertWaspada += 1;
      return acc;
    },
    { alertDarurat: 0, alertSiaga: 0, alertWaspada: 0 },
  );

  const rawanKabupaten = latestByKabupaten.reduce(
    (acc, row) => {
      const status = row?.status_ketersediaan || "Aman";
      if (status === "Sangat Rawan") acc.sangat_rawan += 1;
      else if (status === "Rawan") acc.rawan += 1;
      else if (status === "Waspada") acc.waspada += 1;
      return acc;
    },
    { sangat_rawan: 0, rawan: 0, waspada: 0 },
  );

  const neracaRows = latestByCommodity.filter(
    (row) =>
      row?.jenis_pengendalian === "Neraca Pangan" ||
      row?.neraca_pangan_ketersediaan != null ||
      row?.neraca_pangan_penggunaan != null,
  );

  const validitasData = latestByCommodity.reduce(
    (acc, row) => {
      const validitas = row?.validitas_data || "Valid";
      acc.total += 1;
      if (validitas === "Valid") acc.valid += 1;
      else if (validitas === "Perlu Verifikasi") acc.perlu_verifikasi += 1;
      else acc.tidak_valid += 1;
      return acc;
    },
    { total: 0, valid: 0, perlu_verifikasi: 0, tidak_valid: 0 },
  );

  const updateTerakhir =
    [...pgdRows, ...krwRows]
      .map((row) => recordTimestamp(row))
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || null;

  const level = buildOverallLevel({ ...ewsCounters, rawanKabupaten });
  const kelengkapanPersen =
    validitasData.total > 0
      ? Number(((validitasData.valid / validitasData.total) * 100).toFixed(2))
      : null;

  return {
    ews_status: {
      level,
      alert_aktif:
        ewsCounters.alertDarurat +
        ewsCounters.alertSiaga +
        ewsCounters.alertWaspada,
      update_terakhir: updateTerakhir,
    },
    neraca_pangan: {
      status: neracaRows.length > 0 ? "tersedia" : "belum_lengkap",
      label: neracaRows.length > 0 ? "Tersedia" : "Belum lengkap",
      periode: formatPeriode(updateTerakhir),
      komoditas_tercatat: neracaRows.length,
    },
    kabupaten_rawan:
      rawanKabupaten.sangat_rawan + rawanKabupaten.rawan + rawanKabupaten.waspada,
    validitas_data: validitasData,
    kelengkapan_data_persen: kelengkapanPersen,
    update_terakhir: updateTerakhir,
  };
}

export function buildKetersediaanEwsPanel(pgdRows = [], krwRows = []) {
  const latestByCommodity = pickLatestByKey(
    pgdRows,
    (row) => row?.komoditas_id || row?.nama_komoditas || row?.id,
  );
  const latestByKabupaten = pickLatestByKey(
    krwRows,
    (row) => row?.kabupaten || row?.id,
  );

  const komoditasDefisit = latestByCommodity.filter((row) =>
    ["Defisit", "Menipis"].includes(row?.status_ketersediaan),
  );
  const perluVerifikasi = latestByCommodity.filter(
    (row) => row?.validitas_data === "Perlu Verifikasi",
  );
  const rawanKabupaten = latestByKabupaten.filter((row) =>
    ["Rawan", "Sangat Rawan", "Waspada"].includes(row?.status_ketersediaan),
  );
  const neracaTerbaru = latestByCommodity
    .filter(
      (row) =>
        row?.jenis_pengendalian === "Neraca Pangan" ||
        row?.neraca_pangan_ketersediaan != null ||
        row?.neraca_pangan_penggunaan != null,
    )
    .sort(
      (a, b) =>
        new Date(recordTimestamp(b) || 0).getTime() -
        new Date(recordTimestamp(a) || 0).getTime(),
    )[0];
  const stokTerendah = [...latestByCommodity].sort(
    (a, b) => (toNullableNumber(a?.stok_akhir) ?? Infinity) - (toNullableNumber(b?.stok_akhir) ?? Infinity),
  )[0];

  const statusKeseluruhan = buildOverallLevel({
    alertDarurat: latestByCommodity.filter(
      (row) => row?.early_warning_status === "Darurat",
    ).length,
    alertSiaga: latestByCommodity.filter(
      (row) => row?.early_warning_status === "Siaga",
    ).length,
    alertWaspada: latestByCommodity.filter(
      (row) => row?.early_warning_status === "Waspada",
    ).length,
    rawanKabupaten: rawanKabupaten.reduce(
      (acc, row) => {
        if (row?.status_ketersediaan === "Sangat Rawan") acc.sangat_rawan += 1;
        else if (row?.status_ketersediaan === "Rawan") acc.rawan += 1;
        else acc.waspada += 1;
        return acc;
      },
      { sangat_rawan: 0, rawan: 0, waspada: 0 },
    ),
  });

  const indikator = [
    {
      nama: "Komoditas Defisit atau Menipis",
      status: komoditasDefisit.length > 0 ? "warning" : "aman",
      nilai: `${komoditasDefisit.length} komoditas`,
      threshold: "0 komoditas",
      level: komoditasDefisit.length > 0 ? "warning" : "aman",
    },
    {
      nama: "Data Perlu Verifikasi",
      status: perluVerifikasi.length > 0 ? "warning" : "aman",
      nilai: `${perluVerifikasi.length} dataset`,
      threshold: "0 dataset",
      level: perluVerifikasi.length > 0 ? "warning" : "aman",
    },
    {
      nama: "Kab/Kota Rawan Pangan",
      status:
        rawanKabupaten.length > 0
          ? rawanKabupaten.some(
              (row) => row?.status_ketersediaan === "Sangat Rawan",
            )
            ? "kritis"
            : "warning"
          : "aman",
      nilai: `${rawanKabupaten.length} kab/kota`,
      threshold: "<= 2 kab/kota",
      level:
        rawanKabupaten.length > 0
          ? rawanKabupaten.some(
              (row) => row?.status_ketersediaan === "Sangat Rawan",
            )
            ? "kritis"
            : "warning"
          : "aman",
    },
    {
      nama: "Neraca Pangan Terbaru",
      status: neracaTerbaru ? "aman" : "warning",
      nilai: neracaTerbaru ? formatPeriode(neracaTerbaru.periode) : "Belum tersedia",
      threshold: "Periode berjalan",
      level: neracaTerbaru ? "aman" : "warning",
    },
    {
      nama: "Stok Akhir Terendah",
      status:
        stokTerendah?.status_ketersediaan === "Defisit"
          ? "kritis"
          : stokTerendah?.status_ketersediaan === "Menipis"
            ? "warning"
            : "aman",
      nilai: stokTerendah
        ? `${stokTerendah.nama_komoditas || stokTerendah.komoditas?.nama || "Komoditas"}: ${toNullableNumber(stokTerendah.stok_akhir) ?? 0} ton`
        : "Belum ada data",
      threshold: "Status minimal Aman",
      level:
        stokTerendah?.status_ketersediaan === "Defisit"
          ? "kritis"
          : stokTerendah?.status_ketersediaan === "Menipis"
            ? "warning"
            : "aman",
    },
  ];

  const updateTerakhir =
    [...pgdRows, ...krwRows]
      .map((row) => recordTimestamp(row))
      .filter(Boolean)
      .sort()
      .slice(-1)[0] || null;

  return {
    status_keseluruhan: statusKeseluruhan,
    alert_aktif: indikator.filter((item) => item.level !== "aman").length,
    update_terakhir: updateTerakhir,
    indikator,
    catatan:
      indikator.length > 0
        ? "Panel EWS dibentuk dari data operasional ketersediaan, neraca, dan kerawanan."
        : "Belum ada data operasional untuk membangun EWS.",
  };
}

export function buildNeracaPanganDetail(rows = [], periode = null) {
  const filteredRows = periode
    ? rows.filter((row) => String(row?.periode || "").startsWith(String(periode)))
    : rows;

  const latestByCommodity = pickLatestByKey(
    filteredRows,
    (row) => row?.komoditas_id || row?.nama_komoditas || row?.id,
  );

  const komoditas = latestByCommodity.map((row) => ({
    id: row.id,
    periode: row.periode,
    komoditas_id: row.komoditas_id,
    komoditas:
      row.nama_komoditas || row.komoditas?.nama || `Komoditas ${row.id}`,
    ketersediaan: toNullableNumber(row.neraca_pangan_ketersediaan),
    penggunaan: toNullableNumber(row.neraca_pangan_penggunaan),
    surplus_defisit: toNullableNumber(row.surplus_defisit),
    stok_awal: toNullableNumber(row.stok_awal),
    stok_akhir: toNullableNumber(row.stok_akhir),
    status_ketersediaan: row.status_ketersediaan || "Aman",
    validitas_data: row.validitas_data || "Valid",
    kabupaten: row.kabupaten || null,
  }));

  const totalKetersediaan = komoditas.reduce(
    (sum, row) => sum + (row.ketersediaan ?? 0),
    0,
  );
  const totalPenggunaan = komoditas.reduce(
    (sum, row) => sum + (row.penggunaan ?? 0),
    0,
  );

  return {
    periode: periode || formatPeriode(komoditas[0]?.periode) || null,
    komoditas,
    ringkasan: {
      total_ketersediaan: Number(totalKetersediaan.toFixed(2)),
      total_penggunaan: Number(totalPenggunaan.toFixed(2)),
      total_surplus_defisit: Number((totalKetersediaan - totalPenggunaan).toFixed(2)),
    },
  };
}

