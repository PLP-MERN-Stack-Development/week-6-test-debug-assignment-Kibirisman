const { body, param, query } = require('express-validator');

// Bug validation rules
const createBugValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('reporter')
    .trim()
    .notEmpty()
    .withMessage('Reporter is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Reporter name must be between 2 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in-progress, resolved, closed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  
  body('category')
    .optional()
    .isIn(['frontend', 'backend', 'database', 'api', 'ui/ux', 'performance', 'security', 'other'])
    .withMessage('Category must be one of the predefined values'),
  
  body('severity')
    .optional()
    .isIn(['minor', 'major', 'critical', 'blocker'])
    .withMessage('Severity must be one of: minor, major, critical, blocker'),
  
  body('environment')
    .optional()
    .isIn(['development', 'staging', 'production'])
    .withMessage('Environment must be one of: development, staging, production'),
  
  body('assignee')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Assignee name cannot be more than 50 characters'),
  
  body('expectedBehavior')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Expected behavior cannot be more than 500 characters'),
  
  body('actualBehavior')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Actual behavior cannot be more than 500 characters'),
  
  body('stepsToReproduce')
    .optional()
    .isArray()
    .withMessage('Steps to reproduce must be an array'),
  
  body('stepsToReproduce.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each step must be between 1 and 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
];

const updateBugValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('reporter')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Reporter name must be between 2 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in-progress, resolved, closed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  
  body('category')
    .optional()
    .isIn(['frontend', 'backend', 'database', 'api', 'ui/ux', 'performance', 'security', 'other'])
    .withMessage('Category must be one of the predefined values'),
  
  body('severity')
    .optional()
    .isIn(['minor', 'major', 'critical', 'blocker'])
    .withMessage('Severity must be one of: minor, major, critical, blocker'),
  
  body('environment')
    .optional()
    .isIn(['development', 'staging', 'production'])
    .withMessage('Environment must be one of: development, staging, production'),
  
  body('assignee')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Assignee name cannot be more than 50 characters'),
  
  body('expectedBehavior')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Expected behavior cannot be more than 500 characters'),
  
  body('actualBehavior')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Actual behavior cannot be more than 500 characters'),
  
  body('resolution')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution cannot be more than 1000 characters'),
  
  body('resolvedBy')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Resolver name cannot be more than 50 characters'),
  
  body('stepsToReproduce')
    .optional()
    .isArray()
    .withMessage('Steps to reproduce must be an array'),
  
  body('stepsToReproduce.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each step must be between 1 and 200 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
];

const bugIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid bug ID format'),
];

const bugQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be one of: open, in-progress, resolved, closed'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  
  query('category')
    .optional()
    .isIn(['frontend', 'backend', 'database', 'api', 'ui/ux', 'performance', 'security', 'other'])
    .withMessage('Category must be one of the predefined values'),
  
  query('assignee')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Assignee name must be between 1 and 50 characters'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

const assignBugValidation = [
  body('assignee')
    .trim()
    .notEmpty()
    .withMessage('Assignee is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Assignee name must be between 2 and 50 characters'),
];

const resolveBugValidation = [
  body('resolvedBy')
    .trim()
    .notEmpty()
    .withMessage('Resolver name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Resolver name must be between 2 and 50 characters'),
  
  body('resolution')
    .trim()
    .notEmpty()
    .withMessage('Resolution is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Resolution must be between 10 and 1000 characters'),
];

module.exports = {
  createBugValidation,
  updateBugValidation,
  bugIdValidation,
  bugQueryValidation,
  assignBugValidation,
  resolveBugValidation,
};