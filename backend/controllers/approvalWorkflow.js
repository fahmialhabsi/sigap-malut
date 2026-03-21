// =====================================================
// CONTROLLER: ApprovalworkflowController
// MODEL: Approvalworkflow
// Generated: 2026-03-19T23:39:27.495Z
// =====================================================

import Approvalworkflow from '../models/approvalWorkflow.js';

// @desc    Get all Approvalworkflow records
// @route   GET /api/approvalworkflow
// @access  Private
export const getAllApprovalworkflow = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Approvalworkflow.findAndCountAll({
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
      message: 'Error fetching Approvalworkflow',
      error: error.message
    });
  }
};

// @desc    Get single Approvalworkflow by ID
// @route   GET /api/approvalworkflow/:id
// @access  Private
export const getApprovalworkflowById = async (req, res) => {
  try {
    const record = await Approvalworkflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvalworkflow not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Approvalworkflow',
      error: error.message
    });
  }
};

// @desc    Create new Approvalworkflow
// @route   POST /api/approvalworkflow
// @access  Private
export const createApprovalworkflow = async (req, res) => {
  try {
    const record = await Approvalworkflow.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Approvalworkflow created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Approvalworkflow',
      error: error.message
    });
  }
};

// @desc    Update Approvalworkflow
// @route   PUT /api/approvalworkflow/:id
// @access  Private
export const updateApprovalworkflow = async (req, res) => {
  try {
    const record = await Approvalworkflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvalworkflow not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Approvalworkflow updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Approvalworkflow',
      error: error.message
    });
  }
};

// @desc    Delete Approvalworkflow
// @route   DELETE /api/approvalworkflow/:id
// @access  Private
export const deleteApprovalworkflow = async (req, res) => {
  try {
    const record = await Approvalworkflow.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvalworkflow not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Approvalworkflow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Approvalworkflow',
      error: error.message
    });
  }
};
