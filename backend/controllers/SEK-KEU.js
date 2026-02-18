// =====================================================
// CONTROLLER: SekKeuController
// MODEL: SekKeu
// Generated: 2026-02-17T19:24:48.407Z
// =====================================================

import SekKeu from '../models/SEK-KEU.js';

// @desc    Get all SekKeu records
// @route   GET /api/sek-keu
// @access  Private
export const getAllSekKeu = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekKeu.findAndCountAll({
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
      message: 'Error fetching SekKeu',
      error: error.message
    });
  }
};

// @desc    Get single SekKeu by ID
// @route   GET /api/sek-keu/:id
// @access  Private
export const getSekKeuById = async (req, res) => {
  try {
    const record = await SekKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKeu not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekKeu',
      error: error.message
    });
  }
};

// @desc    Create new SekKeu
// @route   POST /api/sek-keu
// @access  Private
export const createSekKeu = async (req, res) => {
  try {
    const record = await SekKeu.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekKeu created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekKeu',
      error: error.message
    });
  }
};

// @desc    Update SekKeu
// @route   PUT /api/sek-keu/:id
// @access  Private
export const updateSekKeu = async (req, res) => {
  try {
    const record = await SekKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKeu not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekKeu updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekKeu',
      error: error.message
    });
  }
};

// @desc    Delete SekKeu
// @route   DELETE /api/sek-keu/:id
// @access  Private
export const deleteSekKeu = async (req, res) => {
  try {
    const record = await SekKeu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKeu not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekKeu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekKeu',
      error: error.message
    });
  }
};
