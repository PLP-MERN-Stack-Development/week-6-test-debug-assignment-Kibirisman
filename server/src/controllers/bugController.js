const Bug = require('../models/Bug');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Public
const getBugs = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build query object
  const query = {};
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by priority
  if (req.query.priority) {
    query.priority = req.query.priority;
  }
  
  // Filter by assignee
  if (req.query.assignee) {
    query.assignee = req.query.assignee;
  }
  
  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Search in title and description
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  try {
    const bugs = await Bug.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bug.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Retrieved ${bugs.length} bugs for page ${page}`);

    res.status(200).json({
      success: true,
      count: bugs.length,
      total,
      page,
      totalPages,
      data: bugs,
    });
  } catch (error) {
    logger.error('Error fetching bugs:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bugs',
    });
  }
});

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Public
const getBug = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found',
      });
    }

    logger.info(`Retrieved bug ${req.params.id}`);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error(`Error fetching bug ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bug',
    });
  }
});

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Public
const createBug = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const bug = await Bug.create(req.body);
    
    logger.info(`Created new bug: ${bug._id}`);

    res.status(201).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error('Error creating bug:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating bug',
    });
  }
});

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Public
const updateBug = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    let bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found',
      });
    }

    // Update bug fields
    Object.assign(bug, req.body);
    
    // Save to trigger pre-save middleware
    await bug.save();

    logger.info(`Updated bug: ${req.params.id}`);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error(`Error updating bug ${req.params.id}:`, error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while updating bug',
    });
  }
});

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Public
const deleteBug = asyncHandler(async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found',
      });
    }

    await Bug.findByIdAndDelete(req.params.id);

    logger.info(`Deleted bug: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Bug deleted successfully',
    });
  } catch (error) {
    logger.error(`Error deleting bug ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting bug',
    });
  }
});

// @desc    Assign bug to user
// @route   PUT /api/bugs/:id/assign
// @access  Public
const assignBug = asyncHandler(async (req, res) => {
  const { assignee } = req.body;

  if (!assignee) {
    return res.status(400).json({
      success: false,
      error: 'Assignee is required',
    });
  }

  try {
    let bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found',
      });
    }

    bug = await bug.assignTo(assignee);

    logger.info(`Assigned bug ${req.params.id} to ${assignee}`);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error(`Error assigning bug ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error while assigning bug',
    });
  }
});

// @desc    Resolve bug
// @route   PUT /api/bugs/:id/resolve
// @access  Public
const resolveBug = asyncHandler(async (req, res) => {
  const { resolvedBy, resolution } = req.body;

  if (!resolvedBy || !resolution) {
    return res.status(400).json({
      success: false,
      error: 'Resolved by and resolution are required',
    });
  }

  try {
    let bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found',
      });
    }

    bug = await bug.resolve(resolvedBy, resolution);

    logger.info(`Resolved bug ${req.params.id} by ${resolvedBy}`);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    logger.error(`Error resolving bug ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server error while resolving bug',
    });
  }
});

// @desc    Get bug statistics
// @route   GET /api/bugs/stats
// @access  Public
const getBugStats = asyncHandler(async (req, res) => {
  try {
    const totalBugs = await Bug.countDocuments();
    const openBugs = await Bug.countDocuments({ status: 'open' });
    const inProgressBugs = await Bug.countDocuments({ status: 'in-progress' });
    const resolvedBugs = await Bug.countDocuments({ status: 'resolved' });
    const closedBugs = await Bug.countDocuments({ status: 'closed' });
    
    const highPriorityBugs = await Bug.countDocuments({ priority: 'high' });
    const criticalPriorityBugs = await Bug.countDocuments({ priority: 'critical' });

    const stats = {
      total: totalBugs,
      byStatus: {
        open: openBugs,
        inProgress: inProgressBugs,
        resolved: resolvedBugs,
        closed: closedBugs,
      },
      byPriority: {
        high: highPriorityBugs,
        critical: criticalPriorityBugs,
      },
    };

    logger.info('Retrieved bug statistics');

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching bug statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bug statistics',
    });
  }
});

module.exports = {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  assignBug,
  resolveBug,
  getBugStats,
};