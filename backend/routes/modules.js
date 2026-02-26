import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import express from "express";
import { protect } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const MODULES_CSV_PATH = path.resolve(
  __dirname,
  "../../master-data/00_MASTER_MODUL_CONFIG.csv",
);

let cachedModules = null;

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

async function loadModules() {
  if (cachedModules) {
    return cachedModules;
  }

  const rows = await readCSV(MODULES_CSV_PATH);
  cachedModules = rows.map((row) => ({
    modul_id: row.modul_id,
    nama_modul: row.nama_modul,
    bidang: row.bidang,
    kategori: row.kategori,
    tabel_name: row.tabel_name,
    is_active: row.is_active === "true",
  }));

  return cachedModules;
}

router.use(protect);

router.get("/", async (req, res) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Hanya super admin yang bisa mengakses daftar modul",
      });
    }

    const modules = await loadModules();
    const activeModules = modules
      .filter((row) => row.is_active)
      .sort((a, b) => {
        const bidangCompare = (a.bidang || "").localeCompare(b.bidang || "");
        if (bidangCompare !== 0) return bidangCompare;
        return (a.modul_id || "").localeCompare(b.modul_id || "");
      });

    res.json({
      success: true,
      data: activeModules,
      count: activeModules.length,
    });
  } catch (error) {
    console.error("Error reading modules CSV:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membaca daftar modul",
      error: error.message,
    });
  }
});

router.get("/:moduleId", async (req, res) => {
  try {
    const moduleId = String(req.params.moduleId || "").toUpperCase();
    const modules = await loadModules();

    const moduleItem = modules.find(
      (row) => String(row.modul_id || "").toUpperCase() === moduleId,
    );

    if (!moduleItem || !moduleItem.is_active) {
      return res.status(404).json({
        success: false,
        message: "Modul tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: moduleItem,
    });
  } catch (error) {
    console.error("Error reading module detail:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membaca detail modul",
      error: error.message,
    });
  }
});

export default router;
