// =====================================================
// CONTROLLER: BktKrwController
// MODEL: BktKrw
// Generated: 2026-02-17T19:24:48.402Z
// =====================================================

import BktKrw from "../models/BKT-KRW.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BktKrw records
// @route   GET /api/bkt-krw
// @access  Private
export const getAllBktKrw = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BktKrw.findAndCountAll({
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
      message: "Error fetching BktKrw",
      error: error.message,
    });
  }
};

// @desc    Get single BktKrw by ID
// @route   GET /api/bkt-krw/:id
// @access  Private
export const getBktKrwById = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BktKrw",
      error: error.message,
    });
  }
};

// @desc    Create new BktKrw
// @route   POST /api/bkt-krw
// @access  Private
export const createBktKrw = async (req, res) => {
  try {
    const record = await BktKrw.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-KRW",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BktKrw created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BktKrw",
      error: error.message,
    });
  }
};

// @desc    Update BktKrw
// @route   PUT /api/bkt-krw/:id
// @access  Private
export const updateBktKrw = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-KRW",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktKrw updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BktKrw",
      error: error.message,
    });
  }
};

// @desc    Delete BktKrw
// @route   DELETE /api/bkt-krw/:id
// @access  Private
export const deleteBktKrw = async (req, res) => {
  try {
    const record = await BktKrw.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktKrw not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKT-KRW",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktKrw deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BktKrw",
      error: error.message,
    });
  }
};
