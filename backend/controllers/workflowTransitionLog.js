// =====================================================
// CONTROLLER: WorkflowtransitionlogController
// MODEL: Workflowtransitionlog
// Generated: 2026-03-19T23:39:27.596Z
// =====================================================

import Workflowtransitionlog from '../models/workflowTransitionLog.js';

// @desc    Get all Workflowtransitionlog records
// @route   GET /api/workflowtransitionlog
// @access  Private
export const getAllWorkflowtransitionlog = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Workflowtransitionlog.findAndCountAll({
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
      message: 'Error fetching Workflowtransitionlog',
      error: error.message
    });
  }
};

// @desc    Get single Workflowtransitionlog by ID
// @route   GET /api/workflowtransitionlog/:id
// @access  Private
export const getWorkflowtransitionlogById = async (req, res) => {
  try {
    const record = await Workflowtransitionlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowtransitionlog not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Workflowtransitionlog',
      error: error.message
    });
  }
};

// @desc    Create new Workflowtransitionlog
// @route   POST /api/workflowtransitionlog
// @access  Private
export const createWorkflowtransitionlog = async (req, res) => {
  try {
    const record = await Workflowtransitionlog.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Workflowtransitionlog created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Workflowtransitionlog',
      error: error.message
    });
  }
};

// @desc    Update Workflowtransitionlog
// @route   PUT /api/workflowtransitionlog/:id
// @access  Private
export const updateWorkflowtransitionlog = async (req, res) => {
  try {
    const record = await Workflowtransitionlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowtransitionlog not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Workflowtransitionlog updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Workflowtransitionlog',
      error: error.message
    });
  }
};

// @desc    Delete Workflowtransitionlog
// @route   DELETE /api/workflowtransitionlog/:id
// @access  Private
export const deleteWorkflowtransitionlog = async (req, res) => {
  try {
    const record = await Workflowtransitionlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowtransitionlog not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Workflowtransitionlog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Workflowtransitionlog',
      error: error.message
    });
  }
};
