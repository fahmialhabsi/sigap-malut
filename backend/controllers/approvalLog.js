// =====================================================
// CONTROLLER: ApprovallogController
// MODEL: Approvallog
// Generated: 2026-03-19T23:39:27.492Z
// =====================================================

import Approvallog from '../models/approvalLog.js';

// @desc    Get all Approvallog records
// @route   GET /api/approvallog
// @access  Private
export const getAllApprovallog = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Approvallog.findAndCountAll({
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
      message: 'Error fetching Approvallog',
      error: error.message
    });
  }
};

// @desc    Get single Approvallog by ID
// @route   GET /api/approvallog/:id
// @access  Private
export const getApprovallogById = async (req, res) => {
  try {
    const record = await Approvallog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvallog not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Approvallog',
      error: error.message
    });
  }
};

// @desc    Create new Approvallog
// @route   POST /api/approvallog
// @access  Private
export const createApprovallog = async (req, res) => {
  try {
    const record = await Approvallog.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Approvallog created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Approvallog',
      error: error.message
    });
  }
};

// @desc    Update Approvallog
// @route   PUT /api/approvallog/:id
// @access  Private
export const updateApprovallog = async (req, res) => {
  try {
    const record = await Approvallog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvallog not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Approvallog updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Approvallog',
      error: error.message
    });
  }
};

// @desc    Delete Approvallog
// @route   DELETE /api/approvallog/:id
// @access  Private
export const deleteApprovallog = async (req, res) => {
  try {
    const record = await Approvallog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Approvallog not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Approvallog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Approvallog',
      error: error.message
    });
  }
};
