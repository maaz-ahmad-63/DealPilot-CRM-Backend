const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

/**
 * Contact Routes - Phase 2 (API Controllers & Routes)
 * Base path: /api/contacts
 */

// Middleware: Apply auth to all routes
router.use(authMiddleware);

// Multer config for CSV upload
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/contacts/import
 * Bulk import contacts from CSV (MUST BE BEFORE /:id)
 */
router.post(
  '/import',
  upload.single('file'),
  [body('file').notEmpty().withMessage('CSV file is required')],
  contactController.importContacts
);

/**
 * GET /api/contacts/export
 * Export contacts as CSV (MUST BE BEFORE /:id)
 */
router.get('/export', contactController.exportContacts);

/**
 * POST /api/contacts
 * Create a new contact
 */
router.post(
  '/',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('firstName').trim().optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').trim().optional().notEmpty().withMessage('Last name cannot be empty'),
  ],
  contactController.create
);

/**
 * GET /api/contacts
 * Get all contacts with filtering
 */
router.get('/', contactController.getAll);

/**
 * POST /api/contacts/:id/notes
 * Add note to contact
 */
router.post(
  '/:id/notes',
  [body('text').trim().notEmpty().withMessage('Note text is required')],
  contactController.addNote
);

/**
 * POST /api/contacts/:id/tags
 * Add tags to contact
 */
router.post(
  '/:id/tags',
  [body('tags').isArray().withMessage('Tags must be an array')],
  contactController.addTags
);

/**
 * GET /api/contacts/:id/stats
 * Get contact engagement stats
 */
router.get('/:id/stats', contactController.getStats);

/**
 * GET /api/contacts/:id
 * Get single contact
 */
router.get('/:id', contactController.getById);

/**
 * PUT /api/contacts/:id
 * Update contact
 */
router.put('/:id', contactController.update);

/**
 * DELETE /api/contacts/:id
 * Delete contact
 */
router.delete('/:id', contactController.remove);

module.exports = router;
