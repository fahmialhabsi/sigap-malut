// =====================================================
// CONTROLLER: UserLegacyController
// MODEL: UserLegacy
// Generated: 2026-03-19T23:39:27.581Z
// =====================================================

import UserLegacy from "../models/User_legacy.js";

// @desc    Get all UserLegacy records
// @route   GET /api/user_legacy
// @access  Private
export const getAllUserLegacy = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await UserLegacy.findAndCountAll({
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
      message: "Error fetching UserLegacy",
      error: error.message,
    });
  }
};

// @desc    Get single UserLegacy by ID
// @route   GET /api/user_legacy/:id
// @access  Private
export const getUserLegacyById = async (req, res) => {
  try {
    const record = await UserLegacy.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UserLegacy not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching UserLegacy",
      error: error.message,
    });
  }
};

// @desc    Create new UserLegacy
// @route   POST /api/user_legacy
// @access  Private
export const createUserLegacy = async (req, res) => {
  try {
    const record = await UserLegacy.create({
      ...req.body,
      created_by: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "UserLegacy created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating UserLegacy",
      error: error.message,
    });
  }
};

// @desc    Update UserLegacy
// @route   PUT /api/user_legacy/:id
// @access  Private
export const updateUserLegacy = async (req, res) => {
  try {
    const record = await UserLegacy.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UserLegacy not found",
      });
    }

    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });

    res.json({
      success: true,
      message: "UserLegacy updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating UserLegacy",
      error: error.message,
    });
  }
};

// @desc    Delete UserLegacy
// @route   DELETE /api/user_legacy/:id
// @access  Private
export const deleteUserLegacy = async (req, res) => {
  try {
    const record = await UserLegacy.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "UserLegacy not found",
      });
    }

    await record.destroy();

    res.json({
      success: true,
      message: "UserLegacy deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting UserLegacy",
      error: error.message,
    });
  }
};
