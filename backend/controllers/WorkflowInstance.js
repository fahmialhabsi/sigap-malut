// =====================================================
// CONTROLLER: WorkflowinstanceController
// MODEL: Workflowinstance
// Generated: 2026-03-19T23:39:27.591Z
// =====================================================

import Workflowinstance from '../models/WorkflowInstance.js';

// @desc    Get all Workflowinstance records
// @route   GET /api/workflowinstance
// @access  Private
export const getAllWorkflowinstance = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Workflowinstance.findAndCountAll({
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
      message: 'Error fetching Workflowinstance',
      error: error.message
    });
  }
};

// @desc    Get single Workflowinstance by ID
// @route   GET /api/workflowinstance/:id
// @access  Private
export const getWorkflowinstanceById = async (req, res) => {
  try {
    const record = await Workflowinstance.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowinstance not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Workflowinstance',
      error: error.message
    });
  }
};

// @desc    Create new Workflowinstance
// @route   POST /api/workflowinstance
// @access  Private
export const createWorkflowinstance = async (req, res) => {
  try {
    const record = await Workflowinstance.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Workflowinstance created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Workflowinstance',
      error: error.message
    });
  }
};

// @desc    Update Workflowinstance
// @route   PUT /api/workflowinstance/:id
// @access  Private
export const updateWorkflowinstance = async (req, res) => {
  try {
    const record = await Workflowinstance.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowinstance not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Workflowinstance updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Workflowinstance',
      error: error.message
    });
  }
};

// @desc    Delete Workflowinstance
// @route   DELETE /api/workflowinstance/:id
// @access  Private
export const deleteWorkflowinstance = async (req, res) => {
  try {
    const record = await Workflowinstance.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflowinstance not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'Workflowinstance deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Workflowinstance',
      error: error.message
    });
  }
};
