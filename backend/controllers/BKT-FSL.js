// =====================================================
// CONTROLLER: BktFslController
// MODEL: BktFsl
// Generated: 2026-02-17T19:24:48.400Z
// =====================================================

import BktFsl from "../models/BKT-FSL.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BktFsl records
// @route   GET /api/bkt-fsl
// @access  Private
export const getAllBktFsl = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BktFsl.findAndCountAll({
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
      message: "Error fetching BktFsl",
      error: error.message,
    });
  }
};

// @desc    Get single BktFsl by ID
// @route   GET /api/bkt-fsl/:id
// @access  Private
export const getBktFslById = async (req, res) => {
  try {
    const record = await BktFsl.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktFsl not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BktFsl",
      error: error.message,
    });
  }
};

// @desc    Create new BktFsl
// @route   POST /api/bkt-fsl
// @access  Private
export const createBktFsl = async (req, res) => {
  try {
    const record = await BktFsl.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-FSL",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BktFsl created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BktFsl",
      error: error.message,
    });
  }
};

// @desc    Update BktFsl
// @route   PUT /api/bkt-fsl/:id
// @access  Private
export const updateBktFsl = async (req, res) => {
  try {
    const record = await BktFsl.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktFsl not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-FSL",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktFsl updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BktFsl",
      error: error.message,
    });
  }
};

// @desc    Delete BktFsl
// @route   DELETE /api/bkt-fsl/:id
// @access  Private
export const deleteBktFsl = async (req, res) => {
  try {
    const record = await BktFsl.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktFsl not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKT-FSL",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktFsl deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BktFsl",
      error: error.message,
    });
  }
};
