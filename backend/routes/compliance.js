import express from "express";
import fs from "fs";
import path from "path";
import { Parser as CsvParser } from "json2csv";
import PDFDocument from "pdfkit";
const router = express.Router();
const REPORT_PATH = path.resolve(process.cwd(), "reports", "report.json");

// Export CSV
router.get("/report/export/csv", (req, res) => {
  try {
    const data = fs.readFileSync(REPORT_PATH, "utf-8");
    let report = JSON.parse(data);
    const filters = req.query;
    let results = report.results || [];
    if (Object.keys(filters).length > 0 && Array.isArray(results)) {
      results = results.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(String(item[key]));
          }
          return String(item[key]) === String(value);
        });
      });
    }
    const csv = new CsvParser().parse(results);
    res.header("Content-Type", "text/csv");
    res.attachment("compliance-report.csv");
    res.send(csv);
  } catch {
    res.status(404).json({ error: "Report not found" });
  }
});

// Export PDF
router.get("/report/export/pdf", (req, res) => {
  try {
    const data = fs.readFileSync(REPORT_PATH, "utf-8");
    let report = JSON.parse(data);
    const filters = req.query;
    let results = report.results || [];
    if (Object.keys(filters).length > 0 && Array.isArray(results)) {
      results = results.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(String(item[key]));
          }
          return String(item[key]) === String(value);
        });
      });
    }
    const doc = new PDFDocument();
    res.header("Content-Type", "application/pdf");
    res.attachment("compliance-report.pdf");
    doc.pipe(res);
    doc.fontSize(16).text("Compliance Report", { align: "center" });
    doc.moveDown();
    results.forEach((item, idx) => {
      doc.fontSize(12).text(`${idx + 1}. ${JSON.stringify(item)}`);
      doc.moveDown();
    });
    doc.end();
  } catch {
    res.status(404).json({ error: "Report not found" });
  }
});
router.get("/report", (req, res) => {
  try {
    const data = fs.readFileSync(REPORT_PATH, "utf-8");
    let report = JSON.parse(data);
    const filters = req.query;
    if (Object.keys(filters).length > 0 && Array.isArray(report.results)) {
      report.results = report.results.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          // Jika value array, cek apakah item[key] ada di value
          if (Array.isArray(value)) {
            return value.includes(String(item[key]));
          }
          // Jika value string, cek persamaan
          return String(item[key]) === String(value);
        });
      });
    }
    res.json(report);
  } catch {
    res.status(404).json({ error: "Report not found" });
  }
});

export default router;
