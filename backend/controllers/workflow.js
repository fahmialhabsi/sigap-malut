// =====================================================
// CONTROLLER: WorkflowController
// MODEL: Workflow
// Generated: 2026-03-19T23:39:27.582Z
// =====================================================

import Workflow from '../models/workflow.js';

// @desc    Get all Workflow records
// @route   GET /api/workflow
// @access  Private
export const getAllWorkflow = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Workflow.findAndCountAll({
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
      message: 'Error fetching Workflow',
      error: error.message
    });
  }
};

// @desc    Get single Workflow by ID
// @route   GET /api/workflow/:id
// @access  Private
export const getWorkflowById = async (req, res) => {
  try {
    const record = await Workflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Workflow',
      error: error.message
    });
  }
};

// @desc    Create new Workflow
// @route   POST /api/workflow
// @access  Private
export const createWorkflow = async (req, res) => {
  try {
    const record = await Workflow.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Workflow',
      error: error.message
    });
  }
};

// @desc    Update Workflow
// @route   PUT /api/workflow/:id
// @access  Private
export const updateWorkflow = async (req, res) => {
  try {
    const record = await Workflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Workflow',
      error: error.message
    });
  }
};

// @desc    Delete Workflow
// @route   DELETE /api/workflow/:id
// @access  Private
export const deleteWorkflow = async (req, res) => {
  try {
    const record = await Workflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Workflow',
      error: error.message
    });
  }
};
