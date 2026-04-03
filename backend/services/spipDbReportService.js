import ExcelJS from "exceljs";
import { Op } from "sequelize";
import SpipRiskRegister from "../models/SpipRiskRegister.js";
import SpipRtp from "../models/SpipRtp.js";
import SpipMonitoring from "../models/SpipMonitoring.js";
import SpipEvidenceLink from "../models/SpipEvidenceLink.js";
import { computeRangeFromPeriod, getEvidenceSummary } from "./spipEvidenceSummaryService.js";

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

function addSheet(ws, headers, rows) {
  ws.columns = headers.map((h) => ({ header: h, key: h, width: 18 }));
  for (const r of rows) ws.addRow(r);
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  autosizeColumns(ws);
}

export async function buildSpipWorkbookFromDb({ granularity, date, year, month } = {}) {
  const range = computeRangeFromPeriod({ granularity, date, year, month });
  const start = range.start;
  const end = range.end;

  const wb = new ExcelJS.Workbook();
  wb.creator = "SIGAP-MALUT";
  wb.created = new Date();
  wb.modified = new Date();

  const cover = wb.addWorksheet("COVER");
  cover.columns = [
    { header: "kunci", key: "k", width: 24 },
    { header: "nilai", key: "v", width: 80 },
  ];
  cover.addRow({ k: "Laporan", v: "SPIP (DB-driven, audit-ready)" });
  cover.addRow({
    k: "Rentang",
    v: start && end ? `${start.toISOString()} s/d ${end.toISOString()}` : "(invalid period)",
  });
  cover.addRow({ k: "Dibuat pada", v: new Date().toISOString() });
  cover.getRow(1).font = { bold: true };
  cover.views = [{ state: "frozen", ySplit: 1 }];

  const riskWhere = start && end ? { created_at: { [Op.gte]: start, [Op.lt]: end } } : {};
  const rtpWhere = start && end ? { created_at: { [Op.gte]: start, [Op.lt]: end } } : {};
  const monWhere = start && end ? { created_at: { [Op.gte]: start, [Op.lt]: end } } : {};
  const evWhere = start && end ? { created_at: { [Op.gte]: start, [Op.lt]: end } } : {};

  const risks = await SpipRiskRegister.findAll({ where: riskWhere, order: [["created_at", "DESC"]], limit: 5000 });
  const rtps = await SpipRtp.findAll({ where: rtpWhere, order: [["created_at", "DESC"]], limit: 5000 });
  const monitoring = await SpipMonitoring.findAll({ where: monWhere, order: [["created_at", "DESC"]], limit: 5000 });
  const evidenceLinks = await SpipEvidenceLink.findAll({ where: evWhere, order: [["created_at", "DESC"]], limit: 5000 });

  const wsRisk = wb.addWorksheet("Risk Register");
  addSheet(
    wsRisk,
    [
      "id",
      "unit_kerja",
      "periode_tahun",
      "kode_risiko",
      "nama_risiko",
      "kategori_risiko",
      "sasaran_konteks",
      "proses_bisnis_konteks",
      "pemilik_risiko",
      "status",
      "created_at",
      "updated_at",
    ],
    risks.map((r) => r.get({ plain: true })),
  );

  const wsRtp = wb.addWorksheet("RTP");
  addSheet(
    wsRtp,
    [
      "id",
      "risk_id",
      "uraian_rtp",
      "penanggung_jawab",
      "target_tanggal",
      "status",
      "realized_at",
      "created_at",
      "updated_at",
    ],
    rtps.map((r) => r.get({ plain: true })),
  );

  const wsMon = wb.addWorksheet("Pemantauan");
  addSheet(
    wsMon,
    ["id", "risk_id", "jenis", "tanggal", "uraian", "hasil", "nilai", "created_at", "updated_at"],
    monitoring.map((r) => r.get({ plain: true })),
  );

  const wsEv = wb.addWorksheet("Evidence Link");
  addSheet(
    wsEv,
    [
      "id",
      "spip_ref_type",
      "spip_ref_id",
      "sumber_modul",
      "sumber_tabel",
      "sumber_id",
      "judul",
      "url",
      "occurred_at",
      "created_by",
      "created_at",
    ],
    evidenceLinks.map((r) => r.get({ plain: true })),
  );

  const evSummary = await getEvidenceSummary({ start, end, limit: 200 });
  const wsSum = wb.addWorksheet("Ringkasan Bukti");
  wsSum.addRow(["modul", "jumlah"]);
  for (const [k, v] of Object.entries(evSummary.counts || {})) wsSum.addRow([k, v]);
  wsSum.addRow([]);
  wsSum.addRow(["occurred_at", "sumber_modul", "sumber_id", "title"]);
  for (const it of evSummary.items || []) wsSum.addRow([it.occurred_at, it.sumber_modul, it.sumber_id, it.title]);
  wsSum.getRow(1).font = { bold: true };
  wsSum.views = [{ state: "frozen", ySplit: 1 }];
  autosizeColumns(wsSum);

  return { workbook: wb, range };
}

