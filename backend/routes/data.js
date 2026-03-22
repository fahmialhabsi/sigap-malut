// =====================================================
// ROUTES: Generic Module Data
// Base Path: /api/data/:moduleId
// Reads module config from CSV, queries the mapped table
// =====================================================

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import express from "express";
import { protect } from "../middleware/auth.js";
import sequelize from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const MODULES_CSV_PATH = path.resolve(
  __dirname,
  "../../master-data/00_MASTER_MODUL_CONFIG.csv",
);

let cachedModuleMap = null;

function loadModuleMap() {
  if (cachedModuleMap) return Promise.resolve(cachedModuleMap);
  return new Promise((resolve, reject) => {
    const map = {};
    fs.createReadStream(MODULES_CSV_PATH)
      .pipe(csv())
      .on("data", (row) => {
        if (row.modul_id && row.tabel_name) {
          map[row.modul_id.trim().toUpperCase()] = {
            nama_modul: row.nama_modul,
            tabel_name: row.tabel_name.trim(),
            bidang: row.bidang,
          };
        }
      })
      .on("end", () => {
        cachedModuleMap = map;
        resolve(map);
      })
      .on("error", reject);
  });
}

async function tableExists(tableName) {
  try {
    const [results] = await sequelize.query(
      `SELECT to_regclass('public."${tableName}"') AS exists`,
    );
    return results[0]?.exists !== null;
  } catch {
    return false;
  }
}

router.use(protect);

// GET /api/data/:moduleId?page=1&limit=50
router.get("/:moduleId", async (req, res) => {
  try {
    const moduleId = String(req.params.moduleId || "")
      .trim()
      .toUpperCase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const moduleMap = await loadModuleMap();
    const moduleConfig = moduleMap[moduleId];

    if (!moduleConfig) {
      return res.status(404).json({
        success: false,
        message: `Modul ${moduleId} tidak ditemukan`,
      });
    }

    const { tabel_name } = moduleConfig;

    // Check if table exists — if not, return empty data (not an error)
    const exists = await tableExists(tabel_name);
    if (!exists) {
      return res.json({
        success: true,
        modul_id: moduleId,
        nama_modul: moduleConfig.nama_modul,
        rows: [],
        total: 0,
        page,
        limit,
        chart: { labels: [], datasets: [] },
        notifications: [],
        _info: `Tabel '${tabel_name}' belum tersedia`,
      });
    }

    // Safe: tabel_name comes from trusted CSV config, not user input
    const [rows] = await sequelize.query(
      `SELECT * FROM "${tabel_name}" LIMIT :limit OFFSET :offset`,
      { replacements: { limit, offset } },
    );

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM "${tabel_name}"`,
    );

    return res.json({
      success: true,
      modul_id: moduleId,
      nama_modul: moduleConfig.nama_modul,
      rows,
      total: parseInt(total),
      page,
      limit,
      chart: { labels: [], datasets: [] },
      notifications: [],
    });
  } catch (err) {
    console.error("Generic data route error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data modul",
      error: err.message,
    });
  }
});

export default router;
