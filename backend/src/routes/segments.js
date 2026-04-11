const express = require('express');
const router = express.Router();
const segmentController = require('../controllers/segmentController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

/**
 * Segment Routes - Phase 2 (API Controllers & Routes)
 * Base path: /api/segments
 */

// Middleware: Apply auth to all routes
router.use(authMiddleware);

/**
 * POST /api/segments
 * Create a new contact segment
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Segment name is required'),
    body('filters').isArray().withMessage('Filters must be an array'),
  ],
  segmentController.create
);

/**
 * GET /api/segments
 * Get all segments
 */
router.get('/', segmentController.getAll);

/**
 * GET /api/segments/:id/contacts
 * Get contacts in a segment
 */
router.get('/:id/contacts', segmentController.getContacts);

/**
 * GET /api/segments/:id
 * Get single segment
 */
router.get('/:id', segmentController.getById);

/**
 * PUT /api/segments/:id
 * Update segment
 */
router.put('/:id', segmentController.update);

/**
 * DELETE /api/segments/:id
 * Delete segment
 */
router.delete('/:id', segmentController.remove);

module.exports = router;
