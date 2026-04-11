const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

/**
 * Template Routes - Phase 2 (API Controllers & Routes)
 * Base path: /api/templates
 */

// Middleware: Apply auth to all routes
router.use(authMiddleware);

/**
 * POST /api/templates
 * Create a new email template
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
  ],
  templateController.create
);

/**
 * GET /api/templates
 * Get all templates
 */
router.get('/', templateController.getAll);

/**
 * GET /api/templates/:id
 * Get single template
 */
router.get('/:id', templateController.getById);

/**
 * PUT /api/templates/:id
 * Update template
 */
router.put('/:id', templateController.update);

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete('/:id', templateController.remove);

module.exports = router;
