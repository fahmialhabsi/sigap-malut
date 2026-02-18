// =====================================================
// CONTROLLER: SekHumController
// MODEL: SekHum
// Generated: 2026-02-17T19:24:48.405Z
// =====================================================

import SekHum from '../models/SEK-HUM.js';

// @desc    Get all SekHum records
// @route   GET /api/sek-hum
// @access  Private
export const getAllSekHum = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekHum.findAndCountAll({
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
      message: 'Error fetching SekHum',
      error: error.message
    });
  }
};

// @desc    Get single SekHum by ID
// @route   GET /api/sek-hum/:id
// @access  Private
export const getSekHumById = async (req, res) => {
  try {
    const record = await SekHum.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekHum not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekHum',
      error: error.message
    });
  }
};

// @desc    Create new SekHum
// @route   POST /api/sek-hum
// @access  Private
export const createSekHum = async (req, res) => {
  try {
    const record = await SekHum.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekHum created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekHum',
      error: error.message
    });
  }
};

// @desc    Update SekHum
// @route   PUT /api/sek-hum/:id
// @access  Private
export const updateSekHum = async (req, res) => {
  try {
    const record = await SekHum.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekHum not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekHum updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekHum',
      error: error.message
    });
  }
};

// @desc    Delete SekHum
// @route   DELETE /api/sek-hum/:id
// @access  Private
export const deleteSekHum = async (req, res) => {
  try {
    const record = await SekHum.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekHum not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekHum deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekHum',
      error: error.message
    });
  }
};
