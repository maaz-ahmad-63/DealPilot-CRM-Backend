const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

/**
 * AI Routes - Phase 3 (AI Email Generation)
 * Base path: /api/ai
 */

// Middleware: Apply auth to all routes
router.use(authMiddleware);

/**
 * POST /api/ai/generate-email
 * Generate email from topic
 */
router.post(
  '/generate-email',
  [
    body('topic')
      .trim()
      .notEmpty()
      .withMessage('Topic is required')
      .isLength({ min: 5 })
      .withMessage('Topic must be at least 5 characters'),
    body('tone')
      .optional()
      .isIn(['professional', 'casual', 'energetic', 'formal', 'friendly'])
      .withMessage('Invalid tone'),
    body('context')
      .optional()
      .trim(),
    body('targetAudience')
      .optional()
      .trim(),
    body('maxLength')
      .optional()
      .isIn(['short', 'medium', 'long'])
      .withMessage('Invalid maxLength'),
  ],
  aiController.generateEmail
);

/**
 * POST /api/ai/rewrite-email
 * Rewrite email in different tone
 */
router.post(
  '/rewrite-email',
  [
    body('emailText')
      .trim()
      .notEmpty()
      .withMessage('Email text is required')
      .isLength({ min: 10 })
      .withMessage('Email must be at least 10 characters'),
    body('targetTone')
      .optional()
      .isIn(['professional', 'casual', 'energetic', 'formal', 'friendly'])
      .withMessage('Invalid tone'),
  ],
  aiController.rewriteEmail
);

/**
 * POST /api/ai/generate-followup
 * Generate follow-up email
 */
router.post(
  '/generate-followup',
  [
    body('originalEmail')
      .trim()
      .notEmpty()
      .withMessage('Original email is required')
      .isLength({ min: 10 })
      .withMessage('Email must be at least 10 characters'),
    body('days')
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage('Days must be between 1 and 30'),
    body('tone')
      .optional()
      .isIn(['professional', 'casual', 'energetic', 'formal', 'friendly'])
      .withMessage('Invalid tone'),
  ],
  aiController.generateFollowup
);

/**
 * POST /api/ai/optimize-email
 * Optimize email for engagement/clarity/brevity/conversion
 */
router.post(
  '/optimize-email',
  [
    body('emailText')
      .trim()
      .notEmpty()
      .withMessage('Email text is required')
      .isLength({ min: 10 })
      .withMessage('Email must be at least 10 characters'),
    body('focusArea')
      .optional()
      .isIn(['engagement', 'clarity', 'brevity', 'conversion'])
      .withMessage('Invalid focus area'),
    body('industry')
      .optional()
      .trim(),
  ],
  aiController.optimizeEmail
);

/**
 * POST /api/ai/subject-line-variations
 * Generate subject line variations
 */
router.post(
  '/subject-line-variations',
  [
    body('topic')
      .trim()
      .notEmpty()
      .withMessage('Topic is required')
      .isLength({ min: 5 })
      .withMessage('Topic must be at least 5 characters'),
    body('count')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Count must be between 1 and 20'),
  ],
  aiController.generateSubjectVariations
);

/**
 * GET /api/ai/tones
 * Get available tones
 */
router.get('/tones', aiController.getTones);

module.exports = router;
