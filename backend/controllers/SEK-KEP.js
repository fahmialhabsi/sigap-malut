// =====================================================
// CONTROLLER: SekKepController
// MODEL: SekKep
// Generated: 2026-02-17T19:24:48.406Z
// =====================================================

import SekKep from '../models/SEK-KEP.js';

// @desc    Get all SekKep records
// @route   GET /api/sek-kep
// @access  Private
export const getAllSekKep = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekKep.findAndCountAll({
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
      message: 'Error fetching SekKep',
      error: error.message
    });
  }
};

// @desc    Get single SekKep by ID
// @route   GET /api/sek-kep/:id
// @access  Private
export const getSekKepById = async (req, res) => {
  try {
    const record = await SekKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKep not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekKep',
      error: error.message
    });
  }
};

// @desc    Create new SekKep
// @route   POST /api/sek-kep
// @access  Private
export const createSekKep = async (req, res) => {
  try {
    const record = await SekKep.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekKep created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekKep',
      error: error.message
    });
  }
};

// @desc    Update SekKep
// @route   PUT /api/sek-kep/:id
// @access  Private
export const updateSekKep = async (req, res) => {
  try {
    const record = await SekKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKep not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekKep updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekKep',
      error: error.message
    });
  }
};

// @desc    Delete SekKep
// @route   DELETE /api/sek-kep/:id
// @access  Private
export const deleteSekKep = async (req, res) => {
  try {
    const record = await SekKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKep not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekKep deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekKep',
      error: error.message
    });
  }
};
