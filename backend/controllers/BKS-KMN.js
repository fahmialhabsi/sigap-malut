// =====================================================
// CONTROLLER: BksKmnController
// MODEL: BksKmn
// Generated: 2026-02-17T19:24:48.397Z
// =====================================================

import BksKmn from "../models/BKS-KMN.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BksKmn records
// @route   GET /api/bks-kmn
// @access  Private
export const getAllBksKmn = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BksKmn.findAndCountAll({
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
      message: "Error fetching BksKmn",
      error: error.message,
    });
  }
};

// @desc    Get single BksKmn by ID
// @route   GET /api/bks-kmn/:id
// @access  Private
export const getBksKmnById = async (req, res) => {
  try {
    const record = await BksKmn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKmn not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BksKmn",
      error: error.message,
    });
  }
};

// @desc    Create new BksKmn
// @route   POST /api/bks-kmn
// @access  Private
export const createBksKmn = async (req, res) => {
  try {
    const record = await BksKmn.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-KMN",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BksKmn created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BksKmn",
      error: error.message,
    });
  }
};

// @desc    Update BksKmn
// @route   PUT /api/bks-kmn/:id
// @access  Private
export const updateBksKmn = async (req, res) => {
  try {
    const record = await BksKmn.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKmn not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKS-KMN",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksKmn updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BksKmn",
      error: error.message,
    });
  }
};

// @desc    Delete BksKmn
// @route   DELETE /api/bks-kmn/:id
// @access  Private
export const deleteBksKmn = async (req, res) => {
  try {
    const record = await BksKmn.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BksKmn not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKS-KMN",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BksKmn deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BksKmn",
      error: error.message,
    });
  }
};
