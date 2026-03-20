// =====================================================
// CONTROLLER: DataintegrationlogController
// MODEL: Dataintegrationlog
// Generated: 2026-03-19T23:39:27.521Z
// =====================================================

import Dataintegrationlog from '../models/dataIntegrationLog.js';

// @desc    Get all Dataintegrationlog records
// @route   GET /api/dataintegrationlog
// @access  Private
export const getAllDataintegrationlog = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Dataintegrationlog.findAndCountAll({
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
      message: 'Error fetching Dataintegrationlog',
      error: error.message
    });
  }
};

// @desc    Get single Dataintegrationlog by ID
// @route   GET /api/dataintegrationlog/:id
// @access  Private
export const getDataintegrationlogById = async (req, res) => {
  try {
    const record = await Dataintegrationlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Dataintegrationlog not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Dataintegrationlog',
      error: error.message
    });
  }
};

// @desc    Create new Dataintegrationlog
// @route   POST /api/dataintegrationlog
// @access  Private
export const createDataintegrationlog = async (req, res) => {
  try {
    const record = await Dataintegrationlog.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Dataintegrationlog created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Dataintegrationlog',
      error: error.message
    });
  }
};

// @desc    Update Dataintegrationlog
// @route   PUT /api/dataintegrationlog/:id
// @access  Private
export const updateDataintegrationlog = async (req, res) => {
  try {
    const record = await Dataintegrationlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Dataintegrationlog not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Dataintegrationlog updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Dataintegrationlog',
      error: error.message
    });
  }
};

// @desc    Delete Dataintegrationlog
// @route   DELETE /api/dataintegrationlog/:id
// @access  Private
export const deleteDataintegrationlog = async (req, res) => {
  try {
    const record = await Dataintegrationlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Dataintegrationlog not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Dataintegrationlog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Dataintegrationlog',
      error: error.message
    });
  }
};
