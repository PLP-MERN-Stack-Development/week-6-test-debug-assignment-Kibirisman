const express = require('express');
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  assignBug,
  resolveBug,
  getBugStats,
} = require('../controllers/bugController');

const {
  createBugValidation,
  updateBugValidation,
  bugIdValidation,
  bugQueryValidation,
  assignBugValidation,
  resolveBugValidation,
} = require('../utils/validation');

const router = express.Router();

// GET /api/bugs/stats - Get bug statistics (must be before /:id route)
router.get('/stats', getBugStats);

// GET /api/bugs - Get all bugs with filtering and pagination
router.get('/', bugQueryValidation, getBugs);

// GET /api/bugs/:id - Get single bug
router.get('/:id', bugIdValidation, getBug);

// POST /api/bugs - Create new bug
router.post('/', createBugValidation, createBug);

// PUT /api/bugs/:id - Update bug
router.put('/:id', [...bugIdValidation, ...updateBugValidation], updateBug);

// DELETE /api/bugs/:id - Delete bug
router.delete('/:id', bugIdValidation, deleteBug);

// PUT /api/bugs/:id/assign - Assign bug to user
router.put('/:id/assign', [...bugIdValidation, ...assignBugValidation], assignBug);

// PUT /api/bugs/:id/resolve - Resolve bug
router.put('/:id/resolve', [...bugIdValidation, ...resolveBugValidation], resolveBug);

module.exports = router;