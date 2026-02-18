// =====================================================
// CONTROLLER: UptMtuController
// MODEL: UptMtu
// Generated: 2026-02-17T19:24:48.417Z
// =====================================================

import UptMtu from '../models/UPT-MTU.js';

// @desc    Get all UptMtu records
// @route   GET /api/upt-mtu
// @access  Private
export const getAllUptMtu = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await UptMtu.findAndCountAll({
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
      message: 'Error fetching UptMtu',
      error: error.message
    });
  }
};

// @desc    Get single UptMtu by ID
// @route   GET /api/upt-mtu/:id
// @access  Private
export const getUptMtuById = async (req, res) => {
  try {
    const record = await UptMtu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptMtu not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching UptMtu',
      error: error.message
    });
  }
};

// @desc    Create new UptMtu
// @route   POST /api/upt-mtu
// @access  Private
export const createUptMtu = async (req, res) => {
  try {
    const record = await UptMtu.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'UptMtu created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating UptMtu',
      error: error.message
    });
  }
};

// @desc    Update UptMtu
// @route   PUT /api/upt-mtu/:id
// @access  Private
export const updateUptMtu = async (req, res) => {
  try {
    const record = await UptMtu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptMtu not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'UptMtu updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating UptMtu',
      error: error.message
    });
  }
};

// @desc    Delete UptMtu
// @route   DELETE /api/upt-mtu/:id
// @access  Private
export const deleteUptMtu = async (req, res) => {
  try {
    const record = await UptMtu.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptMtu not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'UptMtu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting UptMtu',
      error: error.message
    });
  }
};
