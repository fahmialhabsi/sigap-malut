// =====================================================
// CONTROLLER: SekLksController
// MODEL: SekLks
// Generated: 2026-02-17T19:24:48.409Z
// =====================================================

import SekLks from "../models/SEK-LKS.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all SekLks records
// @route   GET /api/sek-lks
// @access  Private
export const getAllSekLks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await SekLks.findAndCountAll({
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
      message: "Error fetching SekLks",
      error: error.message,
    });
  }
};

// @desc    Get single SekLks by ID
// @route   GET /api/sek-lks/:id
// @access  Private
export const getSekLksById = async (req, res) => {
  try {
    const record = await SekLks.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLks not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SekLks",
      error: error.message,
    });
  }
};

// @desc    Create new SekLks
// @route   POST /api/sek-lks
// @access  Private
export const createSekLks = async (req, res) => {
  try {
    const record = await SekLks.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-LKS",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "SekLks created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating SekLks",
      error: error.message,
    });
  }
};

// @desc    Update SekLks
// @route   PUT /api/sek-lks/:id
// @access  Private
export const updateSekLks = async (req, res) => {
  try {
    const record = await SekLks.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLks not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-LKS",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekLks updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating SekLks",
      error: error.message,
    });
  }
};

// @desc    Delete SekLks
// @route   DELETE /api/sek-lks/:id
// @access  Private
export const deleteSekLks = async (req, res) => {
  try {
    const record = await SekLks.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLks not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "SEK-LKS",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekLks deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SekLks",
      error: error.message,
    });
  }
};
