// =====================================================
// CONTROLLER: WorkflowhistoryController
// MODEL: Workflowhistory
// Generated: 2026-03-19T23:39:27.587Z
// =====================================================

import Workflowhistory from '../models/WorkflowHistory.js';

// @desc    Get all Workflowhistory records
// @route   GET /api/workflowhistory
// @access  Private
export const getAllWorkflowhistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Workflowhistory.findAndCountAll({
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
      message: 'Error fetching Workflowhistory',
      error: error.message
    });
  }
};

// @desc    Get single Workflowhistory by ID
// @route   GET /api/workflowhistory/:id
// @access  Private
export const getWorkflowhistoryById = async (req, res) => {
  try {
    const record = await Workflowhistory.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowhistory not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Workflowhistory',
      error: error.message
    });
  }
};

// @desc    Create new Workflowhistory
// @route   POST /api/workflowhistory
// @access  Private
export const createWorkflowhistory = async (req, res) => {
  try {
    const record = await Workflowhistory.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Workflowhistory created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Workflowhistory',
      error: error.message
    });
  }
};

// @desc    Update Workflowhistory
// @route   PUT /api/workflowhistory/:id
// @access  Private
export const updateWorkflowhistory = async (req, res) => {
  try {
    const record = await Workflowhistory.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowhistory not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Workflowhistory updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Workflowhistory',
      error: error.message
    });
  }
};

// @desc    Delete Workflowhistory
// @route   DELETE /api/workflowhistory/:id
// @access  Private
export const deleteWorkflowhistory = async (req, res) => {
  try {
    const record = await Workflowhistory.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowhistory not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Workflowhistory deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Workflowhistory',
      error: error.message
    });
  }
};
