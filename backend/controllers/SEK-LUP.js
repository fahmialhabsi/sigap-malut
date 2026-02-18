// =====================================================
// CONTROLLER: SekLupController
// MODEL: SekLup
// Generated: 2026-02-17T19:24:48.411Z
// =====================================================

import SekLup from '../models/SEK-LUP.js';

// @desc    Get all SekLup records
// @route   GET /api/sek-lup
// @access  Private
export const getAllSekLup = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekLup.findAndCountAll({
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
      message: 'Error fetching SekLup',
      error: error.message
    });
  }
};

// @desc    Get single SekLup by ID
// @route   GET /api/sek-lup/:id
// @access  Private
export const getSekLupById = async (req, res) => {
  try {
    const record = await SekLup.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLup not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekLup',
      error: error.message
    });
  }
};

// @desc    Create new SekLup
// @route   POST /api/sek-lup
// @access  Private
export const createSekLup = async (req, res) => {
  try {
    const record = await SekLup.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekLup created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekLup',
      error: error.message
    });
  }
};

// @desc    Update SekLup
// @route   PUT /api/sek-lup/:id
// @access  Private
export const updateSekLup = async (req, res) => {
  try {
    const record = await SekLup.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLup not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekLup updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekLup',
      error: error.message
    });
  }
};

// @desc    Delete SekLup
// @route   DELETE /api/sek-lup/:id
// @access  Private
export const deleteSekLup = async (req, res) => {
  try {
    const record = await SekLup.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLup not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekLup deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekLup',
      error: error.message
    });
  }
};
