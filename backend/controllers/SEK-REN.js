// =====================================================
// CONTROLLER: SekRenController
// MODEL: SekRen
// Generated: 2026-02-17T19:24:48.413Z
// =====================================================

import SekRen from '../models/SEK-REN.js';

// @desc    Get all SekRen records
// @route   GET /api/sek-ren
// @access  Private
export const getAllSekRen = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekRen.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekRen',
      error: error.message
    });
  }
};

// @desc    Get single SekRen by ID
// @route   GET /api/sek-ren/:id
// @access  Private
export const getSekRenById = async (req, res) => {
  try {
    const record = await SekRen.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekRen not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekRen',
      error: error.message
    });
  }
};

// @desc    Create new SekRen
// @route   POST /api/sek-ren
// @access  Private
export const createSekRen = async (req, res) => {
  try {
    const record = await SekRen.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekRen created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekRen',
      error: error.message
    });
  }
};

// @desc    Update SekRen
// @route   PUT /api/sek-ren/:id
// @access  Private
export const updateSekRen = async (req, res) => {
  try {
    const record = await SekRen.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekRen not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekRen updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekRen',
      error: error.message
    });
  }
};

// @desc    Delete SekRen
// @route   DELETE /api/sek-ren/:id
// @access  Private
export const deleteSekRen = async (req, res) => {
  try {
    const record = await SekRen.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekRen not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekRen deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekRen',
      error: error.message
    });
  }
};
