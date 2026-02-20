// =====================================================
// CONTROLLER: BdsEvlController
// MODEL: BdsEvl
// Generated: 2026-02-17T19:24:48.388Z
// =====================================================

import BdsEvl from "../models/BDS-EVL.js";

// @desc    Get all BdsEvl records
// @route   GET /api/bds-evl
// @access  Private
export const getAllBdsEvl = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await BdsEvl.findAndCountAll({
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
      message: "Error fetching BdsEvl",
      error: error.message,
    });
  }
};

// @desc    Get single BdsEvl by ID
// @route   GET /api/bds-evl/:id
// @access  Private
export const getBdsEvlById = async (req, res) => {
  try {
    const record = await BdsEvl.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsEvl not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching BdsEvl",
      error: error.message,
    });
  }
};

// @desc    Create new BdsEvl
// @route   POST /api/bds-evl
// @access  Private
export const createBdsEvl = async (req, res) => {
  try {
    const record = await BdsEvl.create({
      ...req.body,
      created_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      modul: "BDS-EVL",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "BdsEvl created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating BdsEvl",
      error: error.message,
    });
  }
};

// @desc    Update BdsEvl
// @route   PUT /api/bds-evl/:id
// @access  Private
export const updateBdsEvl = async (req, res) => {
  try {
    const record = await BdsEvl.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsEvl not found",
      });
    }

    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    // Audit trail
    await logAudit({
      modul: "BDS-EVL",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BdsEvl updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating BdsEvl",
      error: error.message,
    });
  }
};

// @desc    Delete BdsEvl
// @route   DELETE /api/bds-evl/:id
// @access  Private
export const deleteBdsEvl = async (req, res) => {
  try {
    const record = await BdsEvl.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "BdsEvl not found",
      });
    }

    const dataLama = { ...record.get() };
    await record.destroy();
    // Audit trail
    await logAudit({
      modul: "BDS-EVL",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "BdsEvl deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting BdsEvl",
      error: error.message,
    });
  }
};
