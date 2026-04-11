const { body, validationResult } = require('express-validator');

/**
 * Validation Schemas for all inputs
 */

// Campaign Validators
const campaignSchema = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Campaign name is required')
      .isLength({ min: 3 })
      .withMessage('Campaign name must be at least 3 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required'),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Campaign body is required'),
    body('segment')
      .optional()
      .isMongoId()
      .withMessage('Segment must be a valid ID'),
    body('templateId')
      .optional()
      .isMongoId()
      .withMessage('Template ID must be valid'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Campaign name cannot be empty')
      .isLength({ min: 3 })
      .withMessage('Campaign name must be at least 3 characters'),
    body('subject')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Subject cannot be empty'),
    body('body')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Body cannot be empty'),
  ],

  schedule: [
    body('scheduledAt')
      .notEmpty()
      .withMessage('scheduledAt is required')
      .isISO8601()
      .withMessage('scheduledAt must be valid ISO 8601 date'),
  ],
};

// Contact Validators
const contactSchema = {
  create: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)]{7,}$/)
      .withMessage('Phone number is invalid'),
    body('company')
      .optional()
      .trim(),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'unsubscribed', 'bounced'])
      .withMessage('Invalid status'),
  ],

  update: [
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
  ],

  addNote: [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Note text is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('Note must be between 1 and 5000 characters'),
  ],

  addTags: [
    body('tags')
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags.length === 0) {
          throw new Error('At least one tag is required');
        }
        if (tags.length > 20) {
          throw new Error('Maximum 20 tags allowed');
        }
        return true;
      }),
  ],
};

// Template Validators
const templateSchema = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ min: 3 })
      .withMessage('Template name must be at least 3 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required'),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Body is required'),
    body('category')
      .optional()
      .isIn(['welcome', 'followup', 'promotional', 'transactional', 'custom'])
      .withMessage('Invalid category'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Template name cannot be empty'),
    body('category')
      .optional()
      .isIn(['welcome', 'followup', 'promotional', 'transactional', 'custom'])
      .withMessage('Invalid category'),
  ],
};

// Segment Validators
const segmentSchema = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Segment name is required')
      .isLength({ min: 3 })
      .withMessage('Segment name must be at least 3 characters'),
    body('filters')
      .isArray()
      .withMessage('Filters must be an array')
      .custom((filters) => {
        filters.forEach((filter) => {
          if (!filter.field || !filter.operator || filter.value === undefined) {
            throw new Error('Each filter must have field, operator, and value');
          }
          const validOperators = ['eq', 'ne', 'in', 'gt', 'lt', 'contains', 'regex'];
          if (!validOperators.includes(filter.operator)) {
            throw new Error(`Invalid operator: ${filter.operator}`);
          }
        });
        return true;
      }),
    body('description')
      .optional()
      .trim(),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Segment name cannot be empty'),
    body('filters')
      .optional()
      .isArray()
      .withMessage('Filters must be an array'),
  ],
};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  // Schemas
  campaignSchema,
  contactSchema,
  templateSchema,
  segmentSchema,

  // Middleware
  handleValidationErrors,
};
