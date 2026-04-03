import { Op } from "sequelize";
import { InstruksiGubernur, PengajuanKeGubernur } from "../models/index.js";
import { buildExecutionThreadCockpitExtensionKadin } from "./executionThreadHubService.js";

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysUntilDeadline(deadlineStr) {
  if (!deadlineStr) return 999;
  const d = new Date(`${String(deadlineStr).slice(0, 10)}T12:00:00`);
  const today = new Date(`${ymd()}T12:00:00`);
  return Math.floor((d - today) / 86400000);
}

const PRIORITAS_ORDER = { mendesak: 3, tinggi: 2, normal: 1 };

/**
 * Ringkasan eksekutif untuk Kepala Dinas (satu layar prioritas).
 */
export async function buildKadinExecutiveCockpit(kadinId) {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [inbox, pengajuanSaya, selesai90, total90] = await Promise.all([
    InstruksiGubernur.findAll({
      where: {
        assigned_to: kadinId,
        status: { [Op.notIn]: ["draf", "selesai"] },
      },
      order: [["updated_at", "DESC"]],
      limit: 40,
    }),
    PengajuanKeGubernur.findAll({
      where: { submitted_by: kadinId, status: "dikembalikan" },
      order: [["updated_at", "DESC"]],
      limit: 15,
    }),
    InstruksiGubernur.count({
      where: {
        assigned_to: kadinId,
        status: "selesai",
        updated_at: { [Op.gte]: since },
      },
    }),
    InstruksiGubernur.count({
      where: {
        assigned_to: kadinId,
        created_at: { [Op.gte]: since },
      },
    }),
  ]);

  const prioritas_gubernur = inbox
    .map((row) => {
      const j = row.toJSON();
      const pr = String(j.prioritas || "normal").toLowerCase();
      const st = String(j.status || "").toLowerCase();
      const dLeft = daysUntilDeadline(j.deadline);
      let urgency =
        (PRIORITAS_ORDER[pr] || 1) * 100 +
        (st === "diterbitkan" ? 80 : 0) +
        (String(j.jenis) === "tanggap_darurat" ? 150 : 0);
      urgency += Math.max(0, 5 - Math.min(dLeft, 5)) * 25;
      return { ...j, _urgency: urgency, _hari_tersisa: dLeft };
    })
    .sort((a, b) => b._urgency - a._urgency)
    .slice(0, 8)
    .map(({ _urgency, ...rest }) => rest);

  const mendekati_deadline = inbox
    .map((row) => row.toJSON())
    .filter((j) => {
      const st = String(j.status || "").toLowerCase();
      if (st === "selesai" || st === "draf") return false;
      const d = daysUntilDeadline(j.deadline);
      return d >= 0 && d <= 3;
    })
    .sort((a, b) => daysUntilDeadline(a.deadline) - daysUntilDeadline(b.deadline))
    .slice(0, 6);

  const score_pribadi =
    total90 > 0 ? Math.round((selesai90 / total90) * 100) : null;

  const execution_threads =
    await buildExecutionThreadCockpitExtensionKadin(kadinId);

  return {
    generated_at: new Date().toISOString(),
    prioritas_instruksi_gubernur: prioritas_gubernur,
    instruksi_mendekati_deadline: mendekati_deadline,
    performa_skor_90_hari: score_pribadi,
    performa_label:
      score_pribadi == null
        ? "Belum ada data cukup"
        : score_pribadi >= 75
          ? "Baik"
          : score_pribadi >= 50
            ? "Perlu ditingkatkan"
            : "Perlu perhatian",
    pengajuan_dikembalikan: pengajuanSaya.map((r) => r.toJSON()),
    execution_threads,
  };
}
