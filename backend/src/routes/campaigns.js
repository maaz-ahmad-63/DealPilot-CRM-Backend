const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');

/**
 * Campaign Routes - Phase 2 (API Controllers & Routes)
 * Base path: /api/campaigns
 */

// Middleware: Apply auth to all routes
router.use(authMiddleware);

/**
 * POST /api/campaigns
 * Create a new campaign
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Campaign name is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('body').trim().notEmpty().withMessage('Campaign body is required'),
  ],
  campaignController.create
);

/**
 * GET /api/campaigns
 * Get all campaigns
 */
router.get('/', campaignController.getAll);

/**
 * GET /api/campaigns/:id
 * Get single campaign
 */
router.get('/:id', campaignController.getById);

/**
 * PUT /api/campaigns/:id
 * Update campaign
 */
router.put(
  '/:id',
  [body('name').trim().optional().notEmpty().withMessage('Name cannot be empty')],
  campaignController.update
);

/**
 * DELETE /api/campaigns/:id
 * Delete campaign
 */
router.delete('/:id', campaignController.remove);

/**
 * POST /api/campaigns/:id/send
 * Send campaign immediately
 */
router.post('/:id/send', campaignController.send);

/**
 * POST /api/campaigns/:id/schedule
 * Schedule campaign for later
 */
router.post(
  '/:id/schedule',
  [body('scheduledAt').notEmpty().withMessage('scheduledAt is required')],
  campaignController.schedule
);

/**
 * GET /api/campaigns/:id/analytics
 * Get campaign analytics
 */
router.get('/:id/analytics', campaignController.analytics);

module.exports = router;
