// =====================================================
// CONTROLLER: BktBmbController
// MODEL: BktBmb
// Generated: 2026-02-17T19:24:48.399Z
// =====================================================

import BktBmb from "../models/BKT-BMB.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all BktBmb records
// @route   GET /api/bkt-bmb
// @access  Private
export const getAllBktBmb = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BktBmb.findAndCountAll({
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
      message: "Error fetching BktBmb",
      error: error.message,
    });
  }
};

// @desc    Get single BktBmb by ID
// @route   GET /api/bkt-bmb/:id
// @access  Private
export const getBktBmbById = async (req, res) => {
  try {
    const record = await BktBmb.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktBmb not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BktBmb",
      error: error.message,
    });
  }
};

// @desc    Create new BktBmb
// @route   POST /api/bkt-bmb
// @access  Private
export const createBktBmb = async (req, res) => {
  try {
    const record = await BktBmb.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-BMB",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BktBmb created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BktBmb",
      error: error.message,
    });
  }
};

// @desc    Update BktBmb
// @route   PUT /api/bkt-bmb/:id
// @access  Private
export const updateBktBmb = async (req, res) => {
  try {
    const record = await BktBmb.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktBmb not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "BKT-BMB",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktBmb updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BktBmb",
      error: error.message,
    });
  }
};

// @desc    Delete BktBmb
// @route   DELETE /api/bkt-bmb/:id
// @access  Private
export const deleteBktBmb = async (req, res) => {
  try {
    const record = await BktBmb.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BktBmb not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "BKT-BMB",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BktBmb deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BktBmb",
      error: error.message,
    });
  }
};
