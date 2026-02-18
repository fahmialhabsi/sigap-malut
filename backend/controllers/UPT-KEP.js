// =====================================================
// CONTROLLER: UptKepController
// MODEL: UptKep
// Generated: 2026-02-17T19:24:48.416Z
// =====================================================

import UptKep from '../models/UPT-KEP.js';

// @desc    Get all UptKep records
// @route   GET /api/upt-kep
// @access  Private
export const getAllUptKep = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await UptKep.findAndCountAll({
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
      message: 'Error fetching UptKep',
      error: error.message
    });
  }
};

// @desc    Get single UptKep by ID
// @route   GET /api/upt-kep/:id
// @access  Private
export const getUptKepById = async (req, res) => {
  try {
    const record = await UptKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKep not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching UptKep',
      error: error.message
    });
  }
};

// @desc    Create new UptKep
// @route   POST /api/upt-kep
// @access  Private
export const createUptKep = async (req, res) => {
  try {
    const record = await UptKep.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'UptKep created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating UptKep',
      error: error.message
    });
  }
};

// @desc    Update UptKep
// @route   PUT /api/upt-kep/:id
// @access  Private
export const updateUptKep = async (req, res) => {
  try {
    const record = await UptKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKep not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'UptKep updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating UptKep',
      error: error.message
    });
  }
};

// @desc    Delete UptKep
// @route   DELETE /api/upt-kep/:id
// @access  Private
export const deleteUptKep = async (req, res) => {
  try {
    const record = await UptKep.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptKep not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'UptKep deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting UptKep',
      error: error.message
    });
  }
};
