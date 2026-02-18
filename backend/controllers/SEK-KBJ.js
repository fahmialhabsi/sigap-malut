// =====================================================
// CONTROLLER: SekKbjController
// MODEL: SekKbj
// Generated: 2026-02-17T19:24:48.406Z
// =====================================================

import SekKbj from '../models/SEK-KBJ.js';

// @desc    Get all SekKbj records
// @route   GET /api/sek-kbj
// @access  Private
export const getAllSekKbj = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekKbj.findAndCountAll({
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
      message: 'Error fetching SekKbj',
      error: error.message
    });
  }
};

// @desc    Get single SekKbj by ID
// @route   GET /api/sek-kbj/:id
// @access  Private
export const getSekKbjById = async (req, res) => {
  try {
    const record = await SekKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKbj not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekKbj',
      error: error.message
    });
  }
};

// @desc    Create new SekKbj
// @route   POST /api/sek-kbj
// @access  Private
export const createSekKbj = async (req, res) => {
  try {
    const record = await SekKbj.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekKbj created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekKbj',
      error: error.message
    });
  }
};

// @desc    Update SekKbj
// @route   PUT /api/sek-kbj/:id
// @access  Private
export const updateSekKbj = async (req, res) => {
  try {
    const record = await SekKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKbj not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekKbj updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekKbj',
      error: error.message
    });
  }
};

// @desc    Delete SekKbj
// @route   DELETE /api/sek-kbj/:id
// @access  Private
export const deleteSekKbj = async (req, res) => {
  try {
    const record = await SekKbj.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekKbj not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekKbj deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekKbj',
      error: error.message
    });
  }
};
