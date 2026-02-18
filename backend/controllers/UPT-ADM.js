// =====================================================
// CONTROLLER: UptAdmController
// MODEL: UptAdm
// Generated: 2026-02-17T19:24:48.414Z
// =====================================================

import UptAdm from '../models/UPT-ADM.js';

// @desc    Get all UptAdm records
// @route   GET /api/upt-adm
// @access  Private
export const getAllUptAdm = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await UptAdm.findAndCountAll({
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
      message: 'Error fetching UptAdm',
      error: error.message
    });
  }
};

// @desc    Get single UptAdm by ID
// @route   GET /api/upt-adm/:id
// @access  Private
export const getUptAdmById = async (req, res) => {
  try {
    const record = await UptAdm.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptAdm not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching UptAdm',
      error: error.message
    });
  }
};

// @desc    Create new UptAdm
// @route   POST /api/upt-adm
// @access  Private
export const createUptAdm = async (req, res) => {
  try {
    const record = await UptAdm.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'UptAdm created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating UptAdm',
      error: error.message
    });
  }
};

// @desc    Update UptAdm
// @route   PUT /api/upt-adm/:id
// @access  Private
export const updateUptAdm = async (req, res) => {
  try {
    const record = await UptAdm.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptAdm not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'UptAdm updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating UptAdm',
      error: error.message
    });
  }
};

// @desc    Delete UptAdm
// @route   DELETE /api/upt-adm/:id
// @access  Private
export const deleteUptAdm = async (req, res) => {
  try {
    const record = await UptAdm.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'UptAdm not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'UptAdm deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting UptAdm',
      error: error.message
    });
  }
};
