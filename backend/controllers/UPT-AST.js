// =====================================================
// CONTROLLER: UptAstController
// MODEL: UptAst
// Generated: 2026-02-17T19:24:48.415Z
// =====================================================

import UptAst from "../models/UPT-AST.js";

// @desc    Get all UptAst records
// @route   GET /api/upt-ast
// @access  Private
export const getAllUptAst = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await UptAst.findAndCountAll({
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
      message: "Error fetching UptAst",
      error: error.message,
    });
  }
};

// @desc    Get single UptAst by ID
// @route   GET /api/upt-ast/:id
// @access  Private
export const getUptAstById = async (req, res) => {
  try {
    const record = await UptAst.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptAst not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UptAst",
      error: error.message,
    });
  }
};

// @desc    Create new UptAst
// @route   POST /api/upt-ast
// @access  Private
export const createUptAst = async (req, res) => {
  try {
    const record = await UptAst.create({
      ...req.body,
      created_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "create",
      module: "UPT-AST",
      userId: req.user?.id,
      recordId: record.id,
      description: "Created UptAst",
      payload: req.body,
    });
    res.status(201).json({
      success: true,
      message: "UptAst created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating UptAst",
      error: error.message,
    });
  }
};

// @desc    Update UptAst
// @route   PUT /api/upt-ast/:id
// @access  Private
export const updateUptAst = async (req, res) => {
  try {
    const record = await UptAst.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptAst not found",
      });
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "update",
      module: "UPT-AST",
      userId: req.user?.id,
      recordId: record.id,
      description: "Updated UptAst",
      payload: req.body,
    });
    res.json({
      success: true,
      message: "UptAst updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating UptAst",
      error: error.message,
    });
  }
};

// @desc    Delete UptAst
// @route   DELETE /api/upt-ast/:id
// @access  Private
export const deleteUptAst = async (req, res) => {
  try {
    const record = await UptAst.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptAst not found",
      });
    }

    await record.destroy();
    // Audit trail
    await logAudit({
      action: "delete",
      module: "UPT-AST",
      userId: req.user?.id,
      recordId: record.id,
      description: "Deleted UptAst",
      payload: record,
    });
    res.json({
      success: true,
      message: "UptAst deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting UptAst",
      error: error.message,
    });
  }
};
