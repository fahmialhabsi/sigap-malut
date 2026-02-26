// =====================================================
// CONTROLLER: SekAdmController
// MODEL: SekAdm
// Generated: 2026-02-17T19:24:48.404Z
// =====================================================

import SekAdm from "../models/SEK-ADM.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Get all SekAdm records
// @route   GET /api/sek-adm
// @access  Private
export const getAllSekAdm = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const offset = (page - 1) * limit;

    const where = { ...filters };

    const { count, rows } = await SekAdm.findAndCountAll({
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
      message: "Error fetching SekAdm",
      error: error.message,
    });
  }
};

// @desc    Get single SekAdm by ID
// @route   GET /api/sek-adm/:id
// @access  Private
export const getSekAdmById = async (req, res) => {
  try {
    const record = await SekAdm.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAdm not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching SekAdm",
      error: error.message,
    });
  }
};

// @desc    Create new SekAdm
// @route   POST /api/sek-adm
// @access  Private
export const createSekAdm = async (req, res) => {
  try {
    const record = await SekAdm.create({
      ...req.body,
      created_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-ADM",
      entitas_id: record.id,
      aksi: "CREATE",
      data_lama: null,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      message: "SekAdm created successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating SekAdm",
      error: error.message,
    });
  }
};

// @desc    Update SekAdm
// @route   PUT /api/sek-adm/:id
// @access  Private
export const updateSekAdm = async (req, res) => {
  try {
    const record = await SekAdm.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAdm not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.update({
      ...req.body,
      updated_by: req.user?.id,
    });
    await logAudit({
      modul: "SEK-ADM",
      entitas_id: record.id,
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: record,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekAdm updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating SekAdm",
      error: error.message,
    });
  }
};

// @desc    Delete SekAdm
// @route   DELETE /api/sek-adm/:id
// @access  Private
export const deleteSekAdm = async (req, res) => {
  try {
    const record = await SekAdm.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "SekAdm not found",
      });
    }
    const dataLama = { ...record.get() };
    await record.destroy();
    await logAudit({
      modul: "SEK-ADM",
      entitas_id: req.params.id,
      aksi: "DELETE",
      data_lama: dataLama,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({
      success: true,
      message: "SekAdm deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting SekAdm",
      error: error.message,
    });
  }
};
