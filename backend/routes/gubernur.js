import express from "express";
import { protect } from "../middleware/auth.js";
import gubernurGuard from "../middleware/gubernurGuard.js";
import { requireKadinBeforeGubernur } from "../middleware/chainOfCommandGuard.js";

import { getSummary, getPetaPangan, getBriefingHarian } from "../controllers/gubernur/dashboardController.js";
import {
  getExecutiveAttention,
  getExecutiveCockpit,
  getKinerjaKadisRingkas,
  getSaranDeadline,
} from "../controllers/gubernur/executiveController.js";
import { getDashboardHariIni } from "../controllers/gubernur/hariIniController.js";
import {
  createInstruksi,
  listInstruksi,
  getInstruksiDetail,
  updateStatusInstruksi,
  deleteInstruksi,
} from "../controllers/gubernur/instruksiController.js";
import { listPengajuan, getPengajuanDetail, putuskanPengajuan, getRiwayatPengajuan } from "../controllers/gubernur/pengajuanController.js";
import { listNotifikasi, bacaNotifikasi, bacaSemua } from "../controllers/gubernur/notifikasiController.js";
import { listKepalaDinasAssignees } from "../controllers/gubernur/assigneesController.js";
import { getRantaiInstruksi } from "../controllers/gubernur/rantaiPerintahController.js";

const router = express.Router();

router.use(protect, gubernurGuard);

// Dashboard
router.get("/dashboard/summary", getSummary);
router.get("/dashboard/peta-pangan", getPetaPangan);
router.get("/dashboard/briefing-harian", getBriefingHarian);
router.get("/dashboard/perhatian", getExecutiveAttention);
router.get("/dashboard/cockpit", getExecutiveCockpit);
router.get("/dashboard/hari-ini", getDashboardHariIni);
router.get("/pemantauan/kinerja-kadis", getKinerjaKadisRingkas);
router.get("/instruksi/saran-deadline", getSaranDeadline);

// Penerima instruksi (dropdown UI Gubernur)
router.get("/assignees/kepala-dinas", listKepalaDinasAssignees);

// Instruksi Gubernur
router.post("/instruksi", createInstruksi);
router.get("/instruksi", listInstruksi);
router.get("/instruksi/:id", getInstruksiDetail);
router.get("/instruksi/:id/rantai", getRantaiInstruksi);
router.put("/instruksi/:id/status", updateStatusInstruksi);
router.delete("/instruksi/:id", deleteInstruksi);

// Pengajuan dari Kepala Dinas
router.get("/pengajuan", listPengajuan);
router.get("/pengajuan/:id", getPengajuanDetail);
router.post("/pengajuan/:id/putuskan", putuskanPengajuan);
router.get("/pengajuan/:id/riwayat", getRiwayatPengajuan);

// Notifikasi
router.get("/notifikasi", listNotifikasi);
router.put("/notifikasi/:id/baca", bacaNotifikasi);
router.put("/notifikasi/baca-semua", bacaSemua);

// Task governance — Gubernur putuskan task yang dieskalasi dari Kadis (v2.8)
// requireKadinBeforeGubernur: task must be in escalated_to_governor status
router.post("/tasks/:id/approve", requireKadinBeforeGubernur, async (req, res, next) => {
  req.body._governor_action = "governor_approve";
  next();
});
router.post("/tasks/:id/reject", requireKadinBeforeGubernur, async (req, res, next) => {
  req.body._governor_action = "governor_reject";
  next();
});
// Read-only: list tasks escalated to governor
router.get("/tasks/escalated", async (req, res) => {
  try {
    const { default: Task } = await import("../models/Task.js");
    const tasks = await Task.findAll({
      where: { status: "escalated_to_governor" },
      order: [["updated_at", "DESC"]],
      limit: 50,
    });
    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

