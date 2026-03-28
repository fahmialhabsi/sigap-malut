/**
 * backend/routes/dashboard.js
 *
 * Routes untuk Dashboard KPI endpoints:
 *  GET /api/dashboard/sekretaris/summary  — 5 KPI wajib sekretaris
 *  GET /api/inflasi/latest               — inflasi pangan weighted
 *  GET /api/komoditas/stock              — stok & harga per komoditas
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import { withCache } from "../middleware/cacheMiddleware.js";
import { TTL } from "../services/cacheService.js";
import {
  getSekretarisSummary,
  getGubernurSummary,
  getKasubagSummary,
  getKasubagUPTDSummary,
  getKasiUPTDSummary,
  getFungsionalBidangSummary,
  getFungsionalKetersediaanSummary,
  getFungsionalDistribusiSummary,
  getFungsionalKonsumsiSummary,
  getFungsionalUPTDMutuSummary,
  getFungsionalUPTDTeknisSummary,
  getInflasiLatest,
  getKomoditasStock,
} from "../controllers/dashboardController.js";
import {
  getGubernurKPISummary,
  getKinerjaKaDin,
  getIKPMap,
  getGubernurApprovalQueue,
  getGubernurAlerts,
  getKadinKPISummary,
  getKinerjaBawahan,
  getKadinApprovalQueue,
} from "../controllers/dashboardGubernurController.js";
import {
  getFungsionalPerencanaSummary,
  getProgramChart,
  getKoordinasiBidang,
  getDokumenPending,
} from "../controllers/dashboardFungsionalPerencanaController.js";
import {
  getSekretarisKPI,
  getSekretarisKeuangan,
  getSekretarisKepegawaian,
  getApprovalQueueSekretaris,
  approveAction,
  getKasubagKepegawaian,
  getKasubagVerifikasi,
  kasubagVerifikasiAction,
} from "../controllers/dashboardSekretarisController.js";
import { cekStatusSLA } from "../services/slaService.js";
import {
  getFungsionalAnalisSummary,
  getSppPending,
  getGajiStatus,
} from "../controllers/dashboardFungsionalKeuanganController.js";
import {
  getBendaharaSummary,
  getKasSaldo,
  verifySpj,
  rejectSpj,
  bayarSpj,
} from "../controllers/dashboardBendaharaController.js";

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// Ringkasan eksekutif untuk Gubernur — gubernur + super_admin
router.get(
  "/gubernur/summary",
  requireAnyPermission(["dashboard:read", "gubernur:read"]),
  withCache("dashboard:gubernur", TTL.DASHBOARD),
  getGubernurSummary,
);

// Gubernur extended endpoints — perintah, kinerja KaDin, IKP map, approval, alerts
router.get("/gubernur/kpi", requireAnyPermission(["dashboard:read", "gubernur:read"]), getGubernurKPISummary);
router.get("/gubernur/kinerja-kadin", requireAnyPermission(["dashboard:read", "gubernur:read"]), getKinerjaKaDin);
router.get("/gubernur/ikp-map", requireAnyPermission(["dashboard:read", "gubernur:read"]), getIKPMap);
router.get("/gubernur/approval-queue", requireAnyPermission(["dashboard:read", "gubernur:read"]), getGubernurApprovalQueue);
router.get("/gubernur/alerts", requireAnyPermission(["dashboard:read", "gubernur:read"]), getGubernurAlerts);

// Kepala Dinas extended endpoints
router.get("/kepala-dinas/kpi", requireAnyPermission(["dashboard:read", "kepala_dinas:read"]), getKadinKPISummary);
router.get("/kepala-dinas/kinerja-bawahan", requireAnyPermission(["dashboard:read", "kepala_dinas:read"]), getKinerjaBawahan);
router.get("/kepala-dinas/approval-queue", requireAnyPermission(["dashboard:read", "kepala_dinas:read"]), getKadinApprovalQueue);

// Sekretaris extended endpoints
const sekPerm = requireAnyPermission(["dashboard:read", "sekretaris:read", "sek-keu:read"]);
router.get("/sekretaris/kpi", sekPerm, getSekretarisKPI);
router.get("/sekretaris/keuangan", sekPerm, getSekretarisKeuangan);
router.get("/sekretaris/kepegawaian", sekPerm, getSekretarisKepegawaian);
router.get("/sekretaris/approval-queue", sekPerm, getApprovalQueueSekretaris);
router.post("/approval/:id/:aksi", sekPerm, approveAction);

// KPI summary for Sekretaris dashboard — accessible by sekretaris, kepala_dinas, super_admin
router.get(
  "/sekretaris/summary",
  requireAnyPermission(["dashboard:read", "sek-keu:read"]),
  withCache("dashboard:sekretaris", TTL.DASHBOARD),
  getSekretarisSummary,
);

// Fungsional Perencana extended endpoints
const perPerm = requireAnyPermission(["dashboard:read", "fungsional_perencana:read", "fungsional:read"]);
router.get("/fungsional-perencana/kpi", perPerm, getFungsionalPerencanaSummary);
router.get("/fungsional-perencana/program-chart", perPerm, getProgramChart);
router.get("/fungsional-perencana/koordinasi", perPerm, getKoordinasiBidang);
router.get("/fungsional-perencana/dokumen-pending", perPerm, getDokumenPending);

// KPI summary untuk Fungsional Perencana
// KPI summary untuk seluruh varian Fungsional (Sekretariat, UPTD, 3 Bidang)
router.get(
  "/fungsional-perencana/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional_perencana:read",
    "fungsional_ketersediaan:read",
    "fungsional_distribusi:read",
    "fungsional_konsumsi:read",
    "fungsional:read",
    "pejabat_fungsional:read",
  ]),
  withCache("dashboard:fungsional-perencana", TTL.DASHBOARD),
  getSekretarisSummary, // TODO: ganti handler jika KPI berbeda
);

// KPI summary untuk Fungsional Analis Keuangan
const analisPerm = requireAnyPermission([
  "dashboard:read", "fungsional_analis_keuangan:read",
  "fungsional_keuangan:read", "fungsional_analis:read",
  "ppk:read", "sek-keu:read",
]);
router.get("/fungsional-analis/summary", analisPerm, withCache("dashboard:fungsional-analis", TTL.DASHBOARD), getFungsionalAnalisSummary);
router.get("/fungsional-analis/spp-pending", analisPerm, getSppPending);
router.get("/fungsional-analis/gaji-status", analisPerm, getGajiStatus);

// Bendahara endpoints
const bendPerm = requireAnyPermission([
  "dashboard:read", "bendahara:read",
  "bendahara_pengeluaran:read", "sek-keu:read",
]);
router.get("/bendahara/summary",   bendPerm, withCache("dashboard:bendahara", TTL.DASHBOARD), getBendaharaSummary);
router.get("/bendahara/kas-saldo", bendPerm, getKasSaldo);
router.put("/spj/:id/verify",  bendPerm, verifySpj);
router.put("/spj/:id/reject",  bendPerm, rejectSpj);
router.put("/spj/:id/bayar",   bendPerm, bayarSpj);

// KPI summary untuk Pelaksana
router.get(
  "/pelaksana/summary",
  requireAnyPermission(["dashboard:read", "pelaksana:read"]),
  withCache("dashboard:pelaksana", TTL.DASHBOARD),
  getSekretarisSummary, // TODO: ganti handler jika KPI berbeda
);

// Kasubag extended endpoints
const kasubagPerm = requireAnyPermission(["dashboard:read", "kasubag:read", "kasubbag_umum_kepegawaian:read"]);
router.get("/kasubag/kepegawaian", kasubagPerm, getKasubagKepegawaian);
router.get("/kasubag/verifikasi", kasubagPerm, getKasubagVerifikasi);
router.post("/kasubag/verifikasi/:id/:aksi", kasubagPerm, kasubagVerifikasiAction);

// KPI summary untuk Kasubag Umum & Kepegawaian (Sekretariat)
router.get(
  "/kasubag/summary",
  requireAnyPermission([
    "dashboard:read",
    "kasubbag_umum_kepegawaian:read",
    "sek-kep:read",
  ]),
  withCache("dashboard:kasubag", TTL.DASHBOARD),
  getKasubagSummary,
);

// KPI summary untuk Kasubag TU UPTD
router.get(
  "/kasubag-uptd/summary",
  requireAnyPermission([
    "dashboard:read",
    "kasubbag_tu_uptd:read",
    "upt-adm:read",
  ]),
  withCache("dashboard:kasubag-uptd", TTL.DASHBOARD),
  getKasubagUPTDSummary,
);

// KPI summary untuk Kasi Mutu & Kasi Teknis UPTD
router.get(
  "/kasi-uptd/summary",
  requireAnyPermission([
    "dashboard:read",
    "kasi_mutu_uptd:read",
    "kasi_teknis_uptd:read",
    "upt-mtu:read",
    "upt-tkn:read",
  ]),
  withCache("dashboard:kasi-uptd", TTL.DASHBOARD),
  getKasiUPTDSummary,
);

// SLA stats endpoint — untuk widget SLA di Kasubag & Kasi UPTD dashboards
router.get(
  "/sla/stats",
  requireAnyPermission([
    "dashboard:read",
    "task:read",
    "kasubbag_umum_kepegawaian:read",
    "kasubbag_tu_uptd:read",
    "kasi_mutu_uptd:read",
    "kasi_teknis_uptd:read",
  ]),
  async (req, res) => {
    try {
      const { QueryTypes } = await import("sequelize");
      const db = (await import("../config/database.js")).default;

      const tasks = await db
        .query(
          `SELECT id, judul, tipe, status, created_at, updated_at
           FROM tasks
           WHERE status NOT IN ('done','selesai','closed')
             AND deleted_at IS NULL
           ORDER BY created_at ASC
           LIMIT 50`,
          { type: QueryTypes.SELECT },
        )
        .catch(() => []);

      let normal = 0;
      let warning = 0;
      let critical = 0;
      let breach = 0;

      for (const t of tasks) {
        const { status } = cekStatusSLA(t);
        if (status === "normal") normal++;
        else if (status === "warning") warning++;
        else if (status === "critical") critical++;
        else if (status === "breach") breach++;
      }

      res.json({
        success: true,
        data: {
          total: tasks.length,
          normal,
          warning,
          critical,
          breach,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// KPI summary untuk Pejabat Fungsional per bidang
router.get(
  "/fungsional-bidang/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional:read",
    "fungsional_analis:read",
    "fungsional_perencana:read",
    "jabatan_fungsional:read",
    "pejabat_fungsional:read",
  ]),
  withCache("dashboard:fungsional-bidang", TTL.DASHBOARD),
  getFungsionalBidangSummary,
);

// KPI summary untuk Fungsional Bidang Ketersediaan
router.get(
  "/fungsional-ketersediaan/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional:read",
    "fungsional_ketersediaan:read",
    "bkt-pgd:read",
    "bkt-fsl:read",
  ]),
  withCache("dashboard:fungsional-ketersediaan", TTL.DASHBOARD),
  getFungsionalKetersediaanSummary,
);

// KPI summary untuk Fungsional Bidang Distribusi
router.get(
  "/fungsional-distribusi/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional:read",
    "fungsional_distribusi:read",
    "bds-hrg:read",
    "bds-mon:read",
  ]),
  withCache("dashboard:fungsional-distribusi", TTL.DASHBOARD),
  getFungsionalDistribusiSummary,
);

// KPI summary untuk Fungsional Bidang Konsumsi
router.get(
  "/fungsional-konsumsi/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional:read",
    "fungsional_konsumsi:read",
    "bks-evl:read",
    "bks-lap:read",
  ]),
  withCache("dashboard:fungsional-konsumsi", TTL.DASHBOARD),
  getFungsionalKonsumsiSummary,
);

// KPI summary untuk Fungsional UPTD Manajemen Mutu
router.get(
  "/fungsional-uptd-mutu/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional_uptd_mutu:read",
    "fungsional_uptd:read",
    "upt-mtu:read",
    "kasi_mutu_uptd:read",
  ]),
  withCache("dashboard:fungsional-uptd-mutu", TTL.DASHBOARD),
  getFungsionalUPTDMutuSummary,
);

// KPI summary untuk Fungsional UPTD Manajemen Teknis
router.get(
  "/fungsional-uptd-teknis/summary",
  requireAnyPermission([
    "dashboard:read",
    "fungsional_uptd_teknis:read",
    "fungsional_uptd:read",
    "upt-tkn:read",
    "kasi_teknis_uptd:read",
  ]),
  withCache("dashboard:fungsional-uptd-teknis", TTL.DASHBOARD),
  getFungsionalUPTDTeknisSummary,
);

export default router;
