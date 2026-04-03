import { Op } from "sequelize";
import BdsCpd from "../models/BDS-CPD.js";
import BdsMon from "../models/BDS-MON.js";
import BdsKbj from "../models/BDS-KBJ.js";
import BdsLap from "../models/BDS-LAP.js";
import DataIntegrationLog from "../models/dataIntegrationLog.js";
import { buildCppdStatusSummary } from "./bdsCpdService.js";
import {
  buildSarprasKelembagaanSummary,
  normalizeTextList,
} from "./bdsKbjService.js";
import {
  createLpkDispang,
  createMonev,
  resolvePeriodeRpjmdByYear,
} from "./ePelaraService.js";

const FINAL_STATUSES = {
  cpd: ["final", "approved"],
  mon: ["final"],
  kbj: ["disetujui", "final"],
};

const INTEGRATION_TYPE = "sigap_distribusi_finalisasi";
const DESTINATION_TABLE = "e-pelara:monev+lpk-dispang";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getMonthRange(year, month) {
  const start = `${year}-${pad2(month)}-01`;
  const endDate = new Date(Date.UTC(year, month, 0));
  const end = `${year}-${pad2(month)}-${pad2(endDate.getUTCDate())}`;
  return { start, end };
}

function getQuarterRange(year, quarter) {
  const firstMonth = (quarter - 1) * 3 + 1;
  const start = getMonthRange(year, firstMonth).start;
  const end = getMonthRange(year, firstMonth + 2).end;
  return { start, end };
}

function getSemesterRange(year, semester) {
  const startMonth = semester === 2 ? 7 : 1;
  const start = getMonthRange(year, startMonth).start;
  const end = getMonthRange(year, startMonth + 5).end;
  return { start, end };
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
}

function uniqueList(items = []) {
  return Array.from(
    new Set(
      items
        .flatMap((item) => normalizeTextList(item))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function buildDistribusiPeriodWindow(reportLike = {}) {
  const tahun =
    toNumberOrNull(reportLike.tahun) ||
    (() => {
      if (!reportLike.periode) return new Date().getFullYear();
      const parsed = new Date(reportLike.periode);
      return Number.isNaN(parsed.getTime())
        ? new Date().getFullYear()
        : parsed.getUTCFullYear();
    })();

  const bulan =
    toNumberOrNull(reportLike.bulan) ||
    (() => {
      if (!reportLike.periode) return null;
      const parsed = new Date(reportLike.periode);
      return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCMonth() + 1;
    })();
  const triwulan = toNumberOrNull(reportLike.triwulan);
  const semester = toNumberOrNull(reportLike.semester);

  let range = null;
  let label = `Tahun ${tahun}`;

  if (bulan) {
    range = getMonthRange(tahun, bulan);
    label = `Bulan ${pad2(bulan)}/${tahun}`;
  } else if (triwulan) {
    range = getQuarterRange(tahun, triwulan);
    label = `Triwulan ${triwulan} ${tahun}`;
  } else if (semester) {
    range = getSemesterRange(tahun, semester);
    label = `Semester ${semester} ${tahun}`;
  } else if (reportLike.periode) {
    const parsed = new Date(reportLike.periode);
    if (!Number.isNaN(parsed.getTime())) {
      const derivedMonth = parsed.getUTCMonth() + 1;
      range = getMonthRange(tahun, derivedMonth);
      label = `Bulan ${pad2(derivedMonth)}/${tahun}`;
    }
  }

  return {
    tahun,
    bulan,
    triwulan,
    semester,
    label,
    start: range?.start || `${tahun}-01-01`,
    end: range?.end || `${tahun}-12-31`,
  };
}

async function collectOperationalRows(reportLike = {}) {
  const periodWindow = buildDistribusiPeriodWindow(reportLike);

  const commonPeriodFilter = {
    tahun: periodWindow.tahun,
    periode: {
      [Op.gte]: periodWindow.start,
      [Op.lte]: periodWindow.end,
    },
  };

  const [cppdRows, monitoringRows, kebijakanRows] = await Promise.all([
    BdsCpd.findAll({
      where: {
        ...commonPeriodFilter,
        status: { [Op.in]: FINAL_STATUSES.cpd },
      },
      order: [["periode", "DESC"], ["updated_at", "DESC"]],
    }),
    BdsMon.findAll({
      where: {
        ...commonPeriodFilter,
        status: { [Op.in]: FINAL_STATUSES.mon },
      },
      order: [["periode", "DESC"], ["updated_at", "DESC"]],
    }),
    BdsKbj.findAll({
      where: {
        ...commonPeriodFilter,
        status: { [Op.in]: FINAL_STATUSES.kbj },
      },
      order: [["tanggal_dokumen", "DESC"], ["updated_at", "DESC"]],
    }),
  ]);

  return {
    periodWindow,
    cppdRows,
    monitoringRows,
    kebijakanRows,
  };
}

function buildMonitoringSummary(rows = []) {
  const arusRows = rows.filter((row) => row.jenis_monitoring === "Arus Distribusi");
  const hambatanRows = rows.filter(
    (row) => row.jenis_monitoring === "Hambatan Distribusi",
  );
  const fasilitasiRows = rows.filter(
    (row) => row.jenis_monitoring === "Fasilitasi Kelancaran",
  );
  const koordinasiRows = rows.filter(
    (row) => row.jenis_monitoring === "Koordinasi Wilayah",
  );
  const stokRows = rows.filter((row) => row.jenis_monitoring === "Stok Pasar");

  const totalVolumeDistribusi = arusRows.reduce(
    (sum, row) => sum + (toNumberOrNull(row.volume_distribusi) || 0),
    0,
  );
  const pasarKritis = stokRows.filter((row) => row.status_stok === "Kritis").length;

  return {
    total_record: rows.length,
    total_volume_distribusi: Number(totalVolumeDistribusi.toFixed(2)),
    jumlah_arus_distribusi: arusRows.length,
    jumlah_hambatan: hambatanRows.length,
    jumlah_fasilitasi: fasilitasiRows.length,
    jumlah_koordinasi: koordinasiRows.length,
    jumlah_pasar_kritis: pasarKritis,
    wilayah_asal: uniqueList(arusRows.map((row) => row.wilayah_asal)),
    wilayah_tujuan: uniqueList(arusRows.map((row) => row.wilayah_tujuan)),
    hambatan_utama: uniqueList(hambatanRows.map((row) => row.jenis_hambatan)),
    lokasi_hambatan: uniqueList(hambatanRows.map((row) => row.lokasi_hambatan)),
  };
}

function buildExecutiveNarrative(reportLike, cppdSummary, monitoringSummary, kbjSummary) {
  if (toText(reportLike.ringkasan_eksekutif)) {
    return toText(reportLike.ringkasan_eksekutif);
  }

  const parts = [
    `Periode ${buildDistribusiPeriodWindow(reportLike).label}: tersedia ${cppdSummary.stok_cadangan.length} ringkasan komoditas CPPD dengan status keseluruhan ${cppdSummary.status_keseluruhan}.`,
    `Monitoring distribusi memuat ${monitoringSummary.total_record} catatan final dengan volume terlapor ${monitoringSummary.total_volume_distribusi} ton dan ${monitoringSummary.jumlah_hambatan} hambatan distribusi.`,
    `Dokumen sarpras/kelembagaan distribusi tercatat ${kbjSummary.total_dokumen} dokumen final, mencakup ${kbjSummary.titik_distribusi.length} titik distribusi dan ${kbjSummary.stakeholder.length} mitra/stakeholder.`,
  ];

  return parts.join(" ");
}

function buildCapaianDistribusiText(reportLike, monitoringSummary, kbjSummary) {
  if (toText(reportLike.capaian_distribusi)) {
    return toText(reportLike.capaian_distribusi);
  }

  return [
    `Volume distribusi terlapor: ${monitoringSummary.total_volume_distribusi} ton.`,
    `Wilayah tujuan utama: ${
      monitoringSummary.wilayah_tujuan.slice(0, 5).join(", ") || "belum terpetakan"
    }.`,
    `Sarpras distribusi final: ${kbjSummary.dokumen_sarpras} dokumen.`,
    `Kelembagaan distribusi final: ${kbjSummary.dokumen_kelembagaan} dokumen.`,
  ].join(" ");
}

function buildPermasalahanText(reportLike, monitoringSummary) {
  if (toText(reportLike.permasalahan)) {
    return toText(reportLike.permasalahan);
  }

  if (!monitoringSummary.jumlah_hambatan) {
    return "Belum ada hambatan distribusi final yang tercatat pada periode ini.";
  }

  return [
    `Terdapat ${monitoringSummary.jumlah_hambatan} hambatan distribusi final.`,
    `Jenis hambatan dominan: ${
      monitoringSummary.hambatan_utama.slice(0, 5).join(", ") || "belum terklasifikasi"
    }.`,
    `Lokasi utama: ${
      monitoringSummary.lokasi_hambatan.slice(0, 5).join(", ") || "belum terpetakan"
    }.`,
  ].join(" ");
}

function buildRekomendasiText(reportLike, kbjSummary, monitoringSummary) {
  if (toText(reportLike.rekomendasi)) {
    return toText(reportLike.rekomendasi);
  }

  return [
    `Perlu pemutakhiran sarpras distribusi pada ${kbjSummary.titik_distribusi.length || 0} titik distribusi prioritas.`,
    `Perlu penguatan kelembagaan/kemitraan distribusi dengan ${kbjSummary.stakeholder.length || 0} stakeholder aktif.`,
    `Perlu tindak lanjut hambatan distribusi pada ${
      monitoringSummary.lokasi_hambatan.slice(0, 3).join(", ") || "wilayah terdampak"
    }.`,
  ].join(" ");
}

function buildTindakLanjutText(reportLike) {
  return (
    toText(reportLike.tindak_lanjut) ||
    "Tetapkan laporan final sebagai dasar input resmi e-Pelara dan tindak lanjut konsolidasi Sekretariat."
  );
}

function buildSnapshot(reportLike, operational) {
  const cppdSummary = buildCppdStatusSummary(operational.cppdRows);
  const monitoringSummary = buildMonitoringSummary(operational.monitoringRows);
  const kbjSummary = buildSarprasKelembagaanSummary(operational.kebijakanRows);

  const summary = {
    periode: operational.periodWindow,
    cppd: cppdSummary,
    monitoring: monitoringSummary,
    sarpras_kelembagaan: kbjSummary,
    total_sumber_data:
      operational.cppdRows.length +
      operational.monitoringRows.length +
      operational.kebijakanRows.length,
  };

  return {
    summary,
    narrative: {
      ringkasan_eksekutif: buildExecutiveNarrative(
        reportLike,
        cppdSummary,
        monitoringSummary,
        kbjSummary,
      ),
      capaian_distribusi: buildCapaianDistribusiText(
        reportLike,
        monitoringSummary,
        kbjSummary,
      ),
      permasalahan: buildPermasalahanText(reportLike, monitoringSummary),
      rekomendasi: buildRekomendasiText(
        reportLike,
        kbjSummary,
        monitoringSummary,
      ),
      tindak_lanjut: buildTindakLanjutText(reportLike),
    },
  };
}

async function buildEpelaraPayloads(token, reportLike, snapshot) {
  const periode = await resolvePeriodeRpjmdByYear(token, reportLike.tahun);

  if (!periode?.id) {
    throw new Error(
      `Periode RPJMD untuk tahun ${reportLike.tahun} belum tersedia di e-Pelara.`,
    );
  }

  const kegiatan =
    toText(reportLike.judul_laporan) ||
    `Laporan Kinerja Distribusi Pangan ${snapshot.summary.periode.label}`;
  const jenisDokumen = "sigap_distribusi_final";
  const program = "Bidang Distribusi dan Cadangan Pangan";
  const subKegiatan = `Finalisasi laporan distribusi pangan ${snapshot.summary.periode.label}`;
  const indikator =
    "Laporan kinerja distribusi pangan terintegrasi resmi dari SIGAP-MALUT";
  const target = [
    `${snapshot.summary.cppd.stok_cadangan.length} komoditas CPPD`,
    `${snapshot.summary.monitoring.total_record} catatan monitoring`,
    `${snapshot.summary.sarpras_kelembagaan.total_dokumen} dokumen sarpras/kelembagaan`,
  ].join(" | ");
  const realisasi = Number(
    (
      snapshot.summary.monitoring.total_volume_distribusi ||
      snapshot.summary.total_sumber_data ||
      0
    ).toFixed(2),
  );
  const evaluasi = [
    snapshot.narrative.capaian_distribusi,
    `Status CPPD: ${snapshot.summary.cppd.status_keseluruhan}.`,
    `Hambatan final: ${snapshot.summary.monitoring.jumlah_hambatan}.`,
  ].join(" ");

  return {
    periode,
    monev: {
      tahun: String(reportLike.tahun),
      periode_id: periode.id,
      program,
      kegiatan,
      sub_kegiatan: subKegiatan,
      indikator,
      target,
      realisasi,
      evaluasi,
      rekomendasi: snapshot.narrative.rekomendasi,
      jenis_dokumen: jenisDokumen,
    },
    lpkDispang: {
      tahun: String(reportLike.tahun),
      periode_id: periode.id,
      program,
      kegiatan,
      sub_kegiatan: subKegiatan,
      indikator,
      target,
      realisasi,
      evaluasi: snapshot.narrative.capaian_distribusi,
      rekomendasi: snapshot.narrative.rekomendasi,
      jenis_dokumen: jenisDokumen,
    },
  };
}

function buildLockNote(report, actorName, periodLabel) {
  const timestamp = new Date().toISOString();
  const note = `Terkunci ke e-Pelara oleh ${actorName} pada ${timestamp} untuk ${periodLabel}.`;
  return report.sekretariat_notes
    ? `${report.sekretariat_notes}\n${note}`
    : note;
}

async function markSourcesReported(snapshot, reportedAt) {
  const updates = [];

  if (snapshot.context.cppdIds.length) {
    updates.push(
      BdsCpd.update(
        { reported_to_sekretariat: true, reported_at: reportedAt },
        { where: { id: { [Op.in]: snapshot.context.cppdIds } } },
      ),
    );
  }

  if (snapshot.context.monitoringIds.length) {
    updates.push(
      BdsMon.update(
        { reported_to_sekretariat: true, reported_at: reportedAt },
        { where: { id: { [Op.in]: snapshot.context.monitoringIds } } },
      ),
    );
  }

  if (snapshot.context.kebijakanIds.length) {
    updates.push(
      BdsKbj.update(
        { reported_to_sekretariat: true, reported_at: reportedAt },
        { where: { id: { [Op.in]: snapshot.context.kebijakanIds } } },
      ),
    );
  }

  await Promise.all(updates);
}

export async function getBdsLapLockInfo(reportId) {
  const latestSuccess = await DataIntegrationLog.findOne({
    where: {
      source_table: "bds_lap",
      source_record_id: String(reportId),
      destination_table: DESTINATION_TABLE,
      integration_type: INTEGRATION_TYPE,
      status: "success",
    },
    order: [["integrated_at", "DESC"]],
  });

  return {
    locked: Boolean(latestSuccess),
    latestSuccess,
  };
}

export async function buildDistribusiFinalPreview(reportLike = {}) {
  const operational = await collectOperationalRows(reportLike);
  const snapshot = buildSnapshot(reportLike, operational);

  return {
    source: {
      tahun: operational.periodWindow.tahun,
      bulan: operational.periodWindow.bulan,
      triwulan: operational.periodWindow.triwulan,
      semester: operational.periodWindow.semester,
      judul_laporan:
        reportLike.judul_laporan ||
        `Laporan Distribusi ${operational.periodWindow.label}`,
    },
    summary: snapshot.summary,
    narrative: snapshot.narrative,
    context: {
      cppdIds: operational.cppdRows.map((row) => row.id),
      monitoringIds: operational.monitoringRows.map((row) => row.id),
      kebijakanIds: operational.kebijakanRows.map((row) => row.id),
    },
  };
}

export async function syncDistribusiFinalToEPelara({
  reportId,
  token,
  actor,
  force = false,
}) {
  const report = await BdsLap.findByPk(reportId);

  if (!report) {
    return { ok: false, error: "not_found", message: "BDS-LAP tidak ditemukan." };
  }

  if (report.status !== "final") {
    return {
      ok: false,
      error: "report_not_final",
      message: "Laporan harus berstatus final sebelum dikunci ke e-Pelara.",
    };
  }

  const lockInfo = await getBdsLapLockInfo(reportId);
  if (lockInfo.locked && !force) {
    return {
      ok: false,
      error: "already_locked",
      message: "Laporan final ini sudah terkunci ke e-Pelara.",
      lockInfo,
    };
  }

  const preview = await buildDistribusiFinalPreview(report.toJSON());
  const actorName =
    actor?.nama_lengkap || actor?.name || actor?.username || `user-${actor?.id || "system"}`;

  let monevResult = null;
  let lpkResult = null;

  try {
    const payloads = await buildEpelaraPayloads(token, report.toJSON(), preview);

    monevResult = await createMonev(token, payloads.monev);
    lpkResult = await createLpkDispang(token, {
      ...payloads.lpkDispang,
      monev_id: monevResult?.id || null,
    });

    const integratedAt = new Date();
    await DataIntegrationLog.create({
      source_unit: "Bidang Distribusi",
      source_table: "bds_lap",
      source_record_id: String(report.id),
      destination_table: DESTINATION_TABLE,
      integration_type: INTEGRATION_TYPE,
      status: "success",
      integrated_by: actorName,
      integrated_at: integratedAt,
      data_snapshot: {
        preview,
        e_pelara: {
          periode: payloads.periode,
          monev: monevResult,
          lpk_dispang: lpkResult,
        },
      },
    });

    await report.update({
      reported_to_sekretariat: true,
      reported_at: integratedAt,
      sekretariat_notes: buildLockNote(
        report,
        actorName,
        preview.summary.periode.label,
      ),
    });

    await markSourcesReported(preview, integratedAt);

    return {
      ok: true,
      data: {
        report,
        preview,
        e_pelara: {
          monev: monevResult,
          lpk_dispang: lpkResult,
        },
      },
    };
  } catch (error) {
    await DataIntegrationLog.create({
      source_unit: "Bidang Distribusi",
      source_table: "bds_lap",
      source_record_id: String(report.id),
      destination_table: DESTINATION_TABLE,
      integration_type: INTEGRATION_TYPE,
      status: "failed",
      integrated_by: actorName,
      integrated_at: new Date(),
      data_snapshot: {
        preview,
        partial_result: {
          monev: monevResult,
          lpk_dispang: lpkResult,
        },
      },
      error_message: error.message.slice(0, 255),
    });

    return {
      ok: false,
      error: "sync_failed",
      message: error.message,
    };
  }
}
