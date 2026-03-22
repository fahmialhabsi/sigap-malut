// =====================================================
// CONTROLLER: UserController
// MODEL: User
// Generated: 2026-03-19T23:39:27.579Z
// =====================================================

import User from '../models/User.js';

// @desc    Get all User records
// @route   GET /api/user
// @access  Private
export const getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ...filters } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { ...filters };
    
    const { count, rows } = await User.findAndCountAll({
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
      message: 'Error fetching User',
      error: error.message
    });
  }
};

// @desc    Get single User by ID
// @route   GET /api/user/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching User',
      error: error.message
    });
  }
};

// @desc    Create new User
// @route   POST /api/user
// @access  Private
export const createUser = async (req, res) => {
  try {
    const record = await User.create({
      ...req.body,
      created_by: req.user?.id
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating User',
      error: error.message
    });
  }
};

// @desc    Update User
// @route   PUT /api/user/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await record.update({
      ...req.body,
      updated_by: req.user?.id
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating User',
      error: error.message
    });
  }
};

// @desc    Delete User
// @route   DELETE /api/user/:id
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const record = await User.findByPk(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await record.update({ is_deleted: true, deleted_at: new Date(), deleted_by: req.user?.id || null });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting User',
      error: error.message
    });
  }
};
