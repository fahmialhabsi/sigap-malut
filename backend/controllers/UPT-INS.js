// =====================================================
// CONTROLLER: UptInsController
// MODEL: UptIns
// Generated: 2026-02-17T19:24:48.416Z
// =====================================================

import UptIns from "../models/UPT-INS.js";

// @desc    Get all UptIns records
// @route   GET /api/upt-ins
// @access  Private
export const getAllUptIns = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await UptIns.findAndCountAll({
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
      message: "Error fetching UptIns",
      error: error.message,
    });
  }
};

// @desc    Get single UptIns by ID
// @route   GET /api/upt-ins/:id
// @access  Private
export const getUptInsById = async (req, res) => {
  try {
    const record = await UptIns.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptIns not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UptIns",
      error: error.message,
    });
  }
};

// @desc    Create new UptIns
// @route   POST /api/upt-ins
// @access  Private
export const createUptIns = async (req, res) => {
  try {
    const record = await UptIns.create({
      ...req.body,
      created_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "create",
      module: "UPT-INS",
      userId: req.user?.id,
      recordId: record.id,
      description: "Created UptIns",
      payload: req.body,
    });
    res.status(201).json({
      success: true,
      message: "UptIns created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating UptIns",
      error: error.message,
    });
  }
};

// @desc    Update UptIns
// @route   PUT /api/upt-ins/:id
// @access  Private
export const updateUptIns = async (req, res) => {
  try {
    const record = await UptIns.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptIns not found",
      });
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      action: "update",
      module: "UPT-INS",
      userId: req.user?.id,
      recordId: record.id,
      description: "Updated UptIns",
      payload: req.body,
    });
    res.json({
      success: true,
      message: "UptIns updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating UptIns",
      error: error.message,
    });
  }
};

// @desc    Delete UptIns
// @route   DELETE /api/upt-ins/:id
// @access  Private
export const deleteUptIns = async (req, res) => {
  try {
    const record = await UptIns.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UptIns not found",
      });
    }

    await record.destroy();
    // Audit trail
    await logAudit({
      action: "delete",
      module: "UPT-INS",
      userId: req.user?.id,
      recordId: record.id,
      description: "Deleted UptIns",
      payload: record,
    });
    res.json({
      success: true,
      message: "UptIns deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting UptIns",
      error: error.message,
    });
  }
};
