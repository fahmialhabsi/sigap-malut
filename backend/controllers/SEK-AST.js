// =====================================================
// CONTROLLER: SekAstController
// MODEL: SekAst
// Generated: 2026-02-17T19:24:48.404Z
// =====================================================

import SekAst from "../models/SEK-AST.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all SekAst records
// @route   GET /api/sek-ast
// @access  Private
export const getAllSekAst = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await SekAst.findAndCountAll({
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
      message: "Error fetching SekAst",
      error: error.message,
    });
  }
};

// @desc    Get single SekAst by ID
// @route   GET /api/sek-ast/:id
// @access  Private
export const getSekAstById = async (req, res) => {
  try {
    const record = await SekAst.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAst not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SekAst",
      error: error.message,
    });
  }
};

// @desc    Create new SekAst
// @route   POST /api/sek-ast
// @access  Private
export const createSekAst = async (req, res) => {
  try {
    const record = await SekAst.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-AST",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "SekAst created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating SekAst",
      error: error.message,
    });
  }
};

// @desc    Update SekAst
// @route   PUT /api/sek-ast/:id
// @access  Private
export const updateSekAst = async (req, res) => {
  try {
    const record = await SekAst.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAst not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-AST",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekAst updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating SekAst",
      error: error.message,
    });
  }
};

// @desc    Delete SekAst
// @route   DELETE /api/sek-ast/:id
// @access  Private
export const deleteSekAst = async (req, res) => {
  try {
    const record = await SekAst.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAst not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "SEK-AST",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekAst deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SekAst",
      error: error.message,
    });
  }
};
