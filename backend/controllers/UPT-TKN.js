// =====================================================
// CONTROLLER: UptTknController
// MODEL: UptTkn
// Generated: 2026-02-17T19:24:48.418Z
// =====================================================

import UptTkn from "../models/UPT-TKN.js";

// @desc    Get all UptTkn records
// @route   GET /api/upt-tkn
// @access  Private
export const getAllUptTkn = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await UptTkn.findAndCountAll({
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
      message: "Error fetching UptTkn",
      error: error.message,
    });
  }
};

// @desc    Get single UptTkn by ID
// @route   GET /api/upt-tkn/:id
// @access  Private
export const getUptTknById = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UptTkn",
      error: error.message,
    });
  }
};

// @desc    Create new UptTkn
// @route   POST /api/upt-tkn
// @access  Private
export const createUptTkn = async (req, res) => {
  try {
    const record = await UptTkn.create({
      ...req.body,
      created_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "create",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Created UptTkn",
      payload: req.body,
    });
    res.status(201).json({
      success: true,
      message: "UptTkn created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating UptTkn",
      error: error.message,
    });
  }
};

// @desc    Update UptTkn
// @route   PUT /api/upt-tkn/:id
// @access  Private
export const updateUptTkn = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "update",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Updated UptTkn",
      payload: req.body,
    });
    res.json({
      success: true,
      message: "UptTkn updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating UptTkn",
      error: error.message,
    });
  }
};

// @desc    Delete UptTkn
// @route   DELETE /api/upt-tkn/:id
// @access  Private
export const deleteUptTkn = async (req, res) => {
  try {
    const record = await UptTkn.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptTkn not found",
      });
    }

    await record.destroy();
    // Audit trail
    await logAudit({
      action: "delete",
      module: "UPT-TKN",
      userId: req.user?.id,
      recordId: record.id,
      description: "Deleted UptTkn",
      payload: record,
    });
    res.json({
      success: true,
      message: "UptTkn deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting UptTkn",
      error: error.message,
    });
  }
};
