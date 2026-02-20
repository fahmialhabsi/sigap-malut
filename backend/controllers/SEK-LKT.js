// =====================================================
// CONTROLLER: SekLktController
// MODEL: SekLkt
// Generated: 2026-02-17T19:24:48.409Z
// =====================================================

import SekLkt from "../models/SEK-LKT.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all SekLkt records
// @route   GET /api/sek-lkt
// @access  Private
export const getAllSekLkt = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await SekLkt.findAndCountAll({
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
      message: "Error fetching SekLkt",
      error: error.message,
    });
  }
};

// @desc    Get single SekLkt by ID
// @route   GET /api/sek-lkt/:id
// @access  Private
export const getSekLktById = async (req, res) => {
  try {
    const record = await SekLkt.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLkt not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SekLkt",
      error: error.message,
    });
  }
};

// @desc    Create new SekLkt
// @route   POST /api/sek-lkt
// @access  Private
export const createSekLkt = async (req, res) => {
  try {
    const record = await SekLkt.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-LKT",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "SekLkt created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating SekLkt",
      error: error.message,
    });
  }
};

// @desc    Update SekLkt
// @route   PUT /api/sek-lkt/:id
// @access  Private
export const updateSekLkt = async (req, res) => {
  try {
    const record = await SekLkt.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLkt not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-LKT",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekLkt updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating SekLkt",
      error: error.message,
    });
  }
};

// @desc    Delete SekLkt
// @route   DELETE /api/sek-lkt/:id
// @access  Private
export const deleteSekLkt = async (req, res) => {
  try {
    const record = await SekLkt.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekLkt not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "SEK-LKT",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekLkt deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SekLkt",
      error: error.message,
    });
  }
};
