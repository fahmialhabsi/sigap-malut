// =====================================================
// CONTROLLER: BksLapController
// MODEL: BksLap
// Generated: 2026-02-17T19:24:48.398Z
// =====================================================

import BksLap from "../models/BKS-LAP.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BksLap records
// @route   GET /api/bks-lap
// @access  Private
export const getAllBksLap = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BksLap.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BksLap",
      error: error.message,
    });
  }
};

// @desc    Get single BksLap by ID
// @route   GET /api/bks-lap/:id
// @access  Private
export const getBksLapById = async (req, res) => {
  try {
    const record = await BksLap.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksLap not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BksLap",
      error: error.message,
    });
  }
};

// @desc    Create new BksLap
// @route   POST /api/bks-lap
// @access  Private
export const createBksLap = async (req, res) => {
  try {
    const record = await BksLap.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-LAP",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BksLap created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BksLap",
      error: error.message,
    });
  }
};

// @desc    Update BksLap
// @route   PUT /api/bks-lap/:id
// @access  Private
export const updateBksLap = async (req, res) => {
  try {
    const record = await BksLap.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksLap not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-LAP",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksLap updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BksLap",
      error: error.message,
    });
  }
};

// @desc    Delete BksLap
// @route   DELETE /api/bks-lap/:id
// @access  Private
export const deleteBksLap = async (req, res) => {
  try {
    const record = await BksLap.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksLap not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKS-LAP",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksLap deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BksLap",
      error: error.message,
    });
  }
};
