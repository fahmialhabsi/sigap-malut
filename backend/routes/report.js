import express from "express";
const router = express.Router();
import {
  sendSlackNotification,
  sendEmailNotification,
} from "../services/notificationService.js";

import fs from "fs";
import path from "path";
const REPORT_PATH = path.resolve(process.cwd(), "reports", "report.json");

function readReportFile() {
  try {
    const data = fs.readFileSync(REPORT_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { summary: {}, results: [] };
  }
}

function writeReportFile(report) {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

router.get("/", (req, res) => {
  const report = readReportFile();
  res.json(report);
});

router.post("/", (req, res) => {
  const { user, modulId, periode, tipe, evidence, status } = req.body;
  const report = readReportFile();
  const entry = {
    user,
    modulId,
    periode,
    tipe,
    status: status || "generated",
    evidence,
    time: new Date().toISOString(),
  };
  report.results = report.results || [];
  report.results.push(entry);
  writeReportFile(report);
  // Kirim notifikasi jika status compliance berubah
  const notifMsg = `[Compliance] Status: ${entry.status} | Modul: ${modulId} | User: ${user} | Periode: ${periode}`;
  sendSlackNotification(notifMsg);
  sendEmailNotification("Compliance Status Changed", notifMsg);
  res.status(201).json(entry);
});

router.put("/:modulId/:periode/approve", (req, res) => {
  const { modulId, periode } = req.params;
  const { user, tipe } = req.body;
  const report = readReportFile();
  const entry = {
    user,
    modulId,
    periode,
    tipe,
    status: "approved",
    time: new Date().toISOString(),
  };
  report.results = report.results || [];
  report.results.push(entry);
  writeReportFile(report);
  // Kirim notifikasi jika status compliance berubah
  const notifMsg = `[Compliance] Status: approved | Modul: ${modulId} | User: ${user} | Periode: ${periode}`;
  sendSlackNotification(notifMsg);
  sendEmailNotification("Compliance Status Approved", notifMsg);
  res.json(entry);
});

export default router;
