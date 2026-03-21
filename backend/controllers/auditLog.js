// =====================================================
// CONTROLLER: AuditlogController
// MODEL: Auditlog
// Generated: 2026-03-19T23:39:27.496Z
// =====================================================

import Auditlog from '../models/auditLog.js';

// @desc    Get all Auditlog records
// @route   GET /api/auditlog
// @access  Private
export const getAllAuditlog = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await Auditlog.findAndCountAll({
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
      message: 'Error fetching Auditlog',
      error: error.message
    });
  }
};

// @desc    Get single Auditlog by ID
// @route   GET /api/auditlog/:id
// @access  Private
export const getAuditlogById = async (req, res) => {
  try {
    const record = await Auditlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Auditlog not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Auditlog',
      error: error.message
    });
  }
};

// @desc    Create new Auditlog
// @route   POST /api/auditlog
// @access  Private
export const createAuditlog = async (req, res) => {
  try {
    const record = await Auditlog.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Auditlog created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating Auditlog',
      error: error.message
    });
  }
};

// @desc    Update Auditlog
// @route   PUT /api/auditlog/:id
// @access  Private
export const updateAuditlog = async (req, res) => {
  try {
    const record = await Auditlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Auditlog not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'Auditlog updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating Auditlog',
      error: error.message
    });
  }
};

// @desc    Delete Auditlog
// @route   DELETE /api/auditlog/:id
// @access  Private
export const deleteAuditlog = async (req, res) => {
  try {
    const record = await Auditlog.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Auditlog not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Auditlog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Auditlog',
      error: error.message
    });
  }
};
