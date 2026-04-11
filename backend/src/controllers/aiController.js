const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

/**
 * AI Controller - HTTP handlers for AI-powered email generation
 */

/**
 * POST /api/ai/generate-email
 * Generate email from topic using AI
 */
async function generateEmail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, tone = 'professional', context, targetAudience, maxLength } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const email = await aiService.generateEmailFromTopic(workspaceId, topic, tone, {
      context,
      targetAudience,
      maxLength,
    });

    res.json({
      success: true,
      message: 'Email generated successfully',
      data: email,
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate email',
      details: error.message,
    });
  }
}

/**
 * POST /api/ai/rewrite-email
 * Rewrite email in different tone
 */
async function rewriteEmail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailText, targetTone = 'professional' } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!emailText) {
      return res.status(400).json({ error: 'Email text is required' });
    }

    const rewritten = await aiService.rewriteEmail(workspaceId, emailText, targetTone);

    res.json({
      success: true,
      message: 'Email rewritten successfully',
      data: {
        originalTone: 'unknown', // Could track original tone if needed
        targetTone,
        rewrittenEmail: rewritten,
      },
    });
  } catch (error) {
    console.error('Error rewriting email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rewrite email',
      details: error.message,
    });
  }
}

/**
 * POST /api/ai/generate-followup
 * Generate follow-up email based on original
 */
async function generateFollowup(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalEmail, days = 3, tone = 'professional' } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!originalEmail) {
      return res.status(400).json({ error: 'Original email is required' });
    }

    const followup = await aiService.generateFollowupEmail(workspaceId, originalEmail, days, tone);

    res.json({
      success: true,
      message: 'Follow-up email generated successfully',
      data: {
        days,
        followupEmail: followup,
      },
    });
  } catch (error) {
    console.error('Error generating followup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate follow-up email',
      details: error.message,
    });
  }
}

/**
 * POST /api/ai/optimize-email
 * Optimize email for engagement/clarity/brevity/conversion
 */
async function optimizeEmail(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailText, focusArea = 'engagement', industry } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!emailText) {
      return res.status(400).json({ error: 'Email text is required' });
    }

    const optimized = await aiService.optimizeEmail(workspaceId, emailText, {
      focusArea,
      industry,
    });

    res.json({
      success: true,
      message: 'Email optimized successfully',
      data: {
        focusArea,
        optimizedEmail: optimized,
      },
    });
  } catch (error) {
    console.error('Error optimizing email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize email',
      details: error.message,
    });
  }
}

/**
 * POST /api/ai/subject-line-variations
 * Generate multiple subject line options
 */
async function generateSubjectVariations(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, count = 5 } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (count > 20) {
      return res.status(400).json({ error: 'Maximum 20 variations allowed' });
    }

    const variations = await aiService.generateSubjectLineVariations(workspaceId, topic, count);

    res.json({
      success: true,
      message: 'Subject line variations generated',
      data: {
        topic,
        count: variations.length,
        variations,
      },
    });
  } catch (error) {
    console.error('Error generating subject variations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate subject lines',
      details: error.message,
    });
  }
}

/**
 * GET /api/ai/tones
 * Get available tones for email generation
 */
async function getTones(req, res) {
  try {
    const tones = [
      {
        name: 'professional',
        description: 'Formal and business-like tone',
        examples: ['corporate', 'B2B', 'formal'],
      },
      {
        name: 'casual',
        description: 'Friendly and conversational tone',
        examples: ['startup', 'friendly', 'informal'],
      },
      {
        name: 'energetic',
        description: 'Enthusiastic and dynamic tone',
        examples: ['urgent', 'exciting', 'passionate'],
      },
      {
        name: 'formal',
        description: 'Very official and structured tone',
        examples: ['legal', 'official', 'ceremonial'],
      },
      {
        name: 'friendly',
        description: 'Warm and personable tone',
        examples: ['community', 'personal', 'warm'],
      },
    ];

    res.json({
      success: true,
      data: tones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tones',
    });
  }
}

module.exports = {
  generateEmail,
  rewriteEmail,
  generateFollowup,
  optimizeEmail,
  generateSubjectVariations,
  getTones,
};
