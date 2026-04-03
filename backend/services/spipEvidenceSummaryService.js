import { Op } from "sequelize";
import AuditLog from "../models/auditLog.js";
import ApprovalLog from "../models/approvalLog.js";
import Spj from "../models/Spj.js";

async function getSekAstModelOrNull() {
  try {
    const mod = await import("../models/SEK-AST.js");
    return mod?.default || null;
  } catch {
    return null;
  }
}

function toDateOrNull(v) {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function computeRangeFromPeriod({ granularity, date, year, month }) {
  const g = String(granularity || "year").toLowerCase();
  if (g === "day") {
    const d = toDateOrNull(date);
    if (!d) return { start: null, end: null, granularity: "day" };
    const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0));
    const end = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0));
    return { start, end, granularity: "day" };
  }
  if (g === "month") {
    const y = parseInt(String(year), 10);
    const m = parseInt(String(month), 10);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return { start: null, end: null, granularity: "month" };
    }
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    return { start, end, granularity: "month" };
  }
  const y = parseInt(String(year || new Date().getFullYear()), 10);
  if (!Number.isFinite(y)) return { start: null, end: null, granularity: "year" };
  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0));
  return { start, end, granularity: "year" };
}

function normalizeEvidenceItem({ sumber_modul, sumber_id, occurred_at, title, meta = {} }) {
  return {
    sumber_modul,
    sumber_id: sumber_id == null ? null : String(sumber_id),
    occurred_at: occurred_at ? new Date(occurred_at).toISOString() : null,
    title: title || null,
    meta,
  };
}

export async function getEvidenceSummary({ start, end, limit = 50 } = {}) {
  if (!start || !end) {
    return {
      range: { start: null, end: null },
      counts: {},
      items: [],
    };
  }

  const auditLogs = await AuditLog.findAll({
    where: { created_at: { [Op.gte]: start, [Op.lt]: end } },
    order: [["created_at", "DESC"]],
    limit: Math.min(200, limit),
  }).catch(() => []);

  const approvalLogs = await ApprovalLog.findAll({
    where: { timestamp: { [Op.gte]: start, [Op.lt]: end } },
    order: [["timestamp", "DESC"]],
    limit: Math.min(200, limit),
  }).catch(() => []);

  const spj = await Spj.findAll({
    where: { created_at: { [Op.gte]: start, [Op.lt]: end } },
    order: [["created_at", "DESC"]],
    limit: Math.min(200, limit),
  }).catch(() => []);

  const SekAst = await getSekAstModelOrNull();
  const aset = SekAst
    ? await SekAst.findAll({
        where: {
          [Op.or]: [
            { createdAt: { [Op.gte]: start, [Op.lt]: end } },
            { created_at: { [Op.gte]: start, [Op.lt]: end } },
          ],
        },
        order: [["id", "DESC"]],
        limit: Math.min(200, limit),
      })
        .catch(() => [])
    : [];

  const items = [
    ...auditLogs.map((r) =>
      normalizeEvidenceItem({
        sumber_modul: "audit_log",
        sumber_id: r.id,
        occurred_at: r.created_at,
        title: `${r.modul} ${r.aksi} entitas ${r.entitas_id}`,
        meta: { modul: r.modul, aksi: r.aksi, entitas_id: r.entitas_id, pegawai_id: r.pegawai_id },
      }),
    ),
    ...approvalLogs.map((r) =>
      normalizeEvidenceItem({
        sumber_modul: "approval_log",
        sumber_id: r.id,
        occurred_at: r.timestamp,
        title: `Approval ${r.action} layanan ${r.layanan_id}`,
        meta: { layanan_id: r.layanan_id, reviewer_id: r.reviewer_id, action: r.action },
      }),
    ),
    ...spj.map((r) =>
      normalizeEvidenceItem({
        sumber_modul: "spj",
        sumber_id: r.id,
        occurred_at: r.created_at,
        title: `SPJ ${r.nomor_spj || "(tanpa nomor)"} status ${r.status}`,
        meta: { nomor_spj: r.nomor_spj, status: r.status, nominal: r.nominal, tanggal_kegiatan: r.tanggal_kegiatan },
      }),
    ),
    ...aset.map((r) =>
      normalizeEvidenceItem({
        sumber_modul: "sek_ast",
        sumber_id: r.id,
        occurred_at: r.createdAt || r.created_at,
        title: `Aset ${r.nama_aset || "(tanpa nama)"}`,
        meta: { layanan_id: r.layanan_id, unit_kerja: r.unit_kerja, kategori_aset: r.kategori_aset },
      }),
    ),
  ]
    .filter((x) => x.occurred_at)
    .sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)))
    .slice(0, limit);

  const counts = items.reduce((acc, it) => {
    acc[it.sumber_modul] = (acc[it.sumber_modul] || 0) + 1;
    return acc;
  }, {});

  return {
    range: { start: start.toISOString(), end: end.toISOString() },
    counts,
    items,
  };
}

