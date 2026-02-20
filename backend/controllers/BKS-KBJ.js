// =====================================================
// CONTROLLER: BksKbjController
// MODEL: BksKbj
// Generated: 2026-02-17T19:24:48.396Z
// =====================================================

import BksKbj from "../models/BKS-KBJ.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BksKbj records
// @route   GET /api/bks-kbj
// @access  Private
export const getAllBksKbj = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BksKbj.findAndCountAll({
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
      message: "Error fetching BksKbj",
      error: error.message,
    });
  }
};

// @desc    Get single BksKbj by ID
// @route   GET /api/bks-kbj/:id
// @access  Private
export const getBksKbjById = async (req, res) => {
  try {
    const record = await BksKbj.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKbj not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BksKbj",
      error: error.message,
    });
  }
};

// @desc    Create new BksKbj
// @route   POST /api/bks-kbj
// @access  Private
export const createBksKbj = async (req, res) => {
  try {
    const record = await BksKbj.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-KBJ",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BksKbj created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BksKbj",
      error: error.message,
    });
  }
};

// @desc    Update BksKbj
// @route   PUT /api/bks-kbj/:id
// @access  Private
export const updateBksKbj = async (req, res) => {
  try {
    const record = await BksKbj.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKbj not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-KBJ",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksKbj updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BksKbj",
      error: error.message,
    });
  }
};

// @desc    Delete BksKbj
// @route   DELETE /api/bks-kbj/:id
// @access  Private
export const deleteBksKbj = async (req, res) => {
  try {
    const record = await BksKbj.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKbj not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKS-KBJ",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksKbj deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BksKbj",
      error: error.message,
    });
  }
};
