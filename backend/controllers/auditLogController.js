import AuditLog from "../models/auditLog.js";
import { Op } from "sequelize";
import { Parser as Json2csvParser } from "json2csv";

// GET /api/audit-log?modul=&aksi=&pegawai_id=&start=&end=&limit=&page=
export const getAuditLogs = async (req, res) => {
  try {
    const {
      modul,
      aksi,
      pegawai_id,
      entitas_id,
      start,
      end,
      limit = 50,
      page = 1,
    } = req.query;
    const where = {};
    if (modul) where.modul = modul;
    if (aksi) where.aksi = aksi;
    if (pegawai_id) where.pegawai_id = pegawai_id;
    if (entitas_id) where.entitas_id = entitas_id;
    if (start || end) {
      where.created_at = {};
      if (start) where.created_at[Op.gte] = new Date(start);
      if (end) where.created_at[Op.lte] = new Date(end);
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal mengambil audit log",
        error: err.message,
      });
  }
};

// GET /api/audit-log/export?format=csv|json&...filter
export const exportAuditLogs = async (req, res) => {
  try {
    const {
      modul,
      aksi,
      pegawai_id,
      entitas_id,
      start,
      end,
      format = "csv",
      limit = 1000,
    } = req.query;
    const where = {};
    if (modul) where.modul = modul;
    if (aksi) where.aksi = aksi;
    if (pegawai_id) where.pegawai_id = pegawai_id;
    if (entitas_id) where.entitas_id = entitas_id;
    if (start || end) {
      where.created_at = {};
      if (start) where.created_at[Op.gte] = new Date(start);
      if (end) where.created_at[Op.lte] = new Date(end);
    }
    const logs = await AuditLog.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
    });
    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      return res.json(logs);
    }
    // Default: CSV
    const fields = [
      "id",
      "modul",
      "aksi",
      "entitas_id",
      "pegawai_id",
      "created_at",
    ];
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(logs.map((l) => l.toJSON()));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit-log.csv");
    res.send(csv);
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Gagal export audit log",
        error: err.message,
      });
  }
};
