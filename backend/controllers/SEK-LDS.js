// =====================================================
// CONTROLLER: SekLdsController
// MODEL: SekLds
// Generated: 2026-02-17T19:24:48.408Z
// =====================================================

import SekLds from '../models/SEK-LDS.js';

// @desc    Get all SekLds records
// @route   GET /api/sek-lds
// @access  Private
export const getAllSekLds = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await SekLds.findAndCountAll({
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
      message: 'Error fetching SekLds',
      error: error.message
    });
  }
};

// @desc    Get single SekLds by ID
// @route   GET /api/sek-lds/:id
// @access  Private
export const getSekLdsById = async (req, res) => {
  try {
    const record = await SekLds.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLds not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching SekLds',
      error: error.message
    });
  }
};

// @desc    Create new SekLds
// @route   POST /api/sek-lds
// @access  Private
export const createSekLds = async (req, res) => {
  try {
    const record = await SekLds.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'SekLds created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating SekLds',
      error: error.message
    });
  }
};

// @desc    Update SekLds
// @route   PUT /api/sek-lds/:id
// @access  Private
export const updateSekLds = async (req, res) => {
  try {
    const record = await SekLds.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLds not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'SekLds updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating SekLds',
      error: error.message
    });
  }
};

// @desc    Delete SekLds
// @route   DELETE /api/sek-lds/:id
// @access  Private
export const deleteSekLds = async (req, res) => {
  try {
    const record = await SekLds.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'SekLds not found'
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'SekLds deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting SekLds',
      error: error.message
    });
  }
};
