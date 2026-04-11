const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const smartCrmService = require('../services/smartCrmService');

const router = express.Router();

router.use(authMiddleware);

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
}

router.post('/score-lead', [body('lead').isObject().withMessage('lead payload is required')], (req, res) => {
  if (!handleValidation(req, res)) return;

  const result = smartCrmService.computeLeadScore(req.body.lead);
  res.json({ success: true, data: result });
});

router.post('/next-action', [body('lead').isObject().withMessage('lead payload is required')], (req, res) => {
  if (!handleValidation(req, res)) return;

  const action = smartCrmService.nextBestAction(req.body.lead);
  res.json({ success: true, data: { action } });
});

router.post('/extract-lead', [body('rawText').trim().notEmpty().withMessage('rawText is required')], (req, res) => {
  if (!handleValidation(req, res)) return;

  const extracted = smartCrmService.extractLead(req.body.rawText);
  res.json({ success: true, data: extracted });
});

router.post('/generate-followup', [body('lead').isObject().withMessage('lead payload is required')], (req, res) => {
  if (!handleValidation(req, res)) return;

  const channel = req.body.channel || 'email';
  const message = smartCrmService.generateFollowup(req.body.lead, channel);
  res.json({ success: true, data: { channel, message } });
});

router.post('/sales-assistant', [body('lead').isObject().withMessage('lead payload is required')], (req, res) => {
  if (!handleValidation(req, res)) return;

  const notes = req.body.notes || '';
  const data = smartCrmService.salesAssistant(req.body.lead, notes);
  res.json({ success: true, data });
});

module.exports = router;
