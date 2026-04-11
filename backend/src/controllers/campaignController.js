const campaignService = require('../services/campaignService');
const { validationResult } = require('express-validator');

/**
 * Campaign Controller - HTTP handlers for email campaigns
 */

/**
 * POST /api/campaigns
 * Create a new email campaign
 */
async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, body, htmlBody, templateId, templateVariables, segment, tags } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const campaign = await campaignService.createCampaign(
      {
        name,
        subject,
        body,
        htmlBody,
        templateId,
        templateVariables,
        segment,
        tags,
      },
      workspaceId
    );

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign', details: error.message });
  }
}

/**
 * GET /api/campaigns
 * Get all campaigns for workspace with filtering
 */
async function getAll(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const campaigns = await campaignService.getCampaignsByWorkspace(
      workspaceId,
      { status, search, page: parseInt(page), limit: parseInt(limit) }
    );

    res.json({
      success: true,
      data: campaigns.campaigns,
      pagination: {
        total: campaigns.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(campaigns.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns', details: error.message });
  }
}

/**
 * GET /api/campaigns/:id
 * Get single campaign
 */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const campaign = await campaignService.getCampaignById(id, workspaceId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign', details: error.message });
  }
}

/**
 * PUT /api/campaigns/:id
 * Update campaign
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const campaign = await campaignService.updateCampaign(id, req.body, workspaceId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign', details: error.message });
  }
}

/**
 * DELETE /api/campaigns/:id
 * Delete campaign
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const result = await campaignService.deleteCampaign(id, workspaceId);

    if (!result) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign', details: error.message });
  }
}

/**
 * POST /api/campaigns/:id/send
 * Send campaign immediately
 */
async function send(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const result = await campaignService.sendCampaign(id, workspaceId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        campaignId: id,
        emailsQueued: result.emailsQueued,
        jobIds: result.jobIds,
      },
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign', details: error.message });
  }
}

/**
 * POST /api/campaigns/:id/schedule
 * Schedule campaign for later
 */
async function schedule(req, res) {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }

    const campaign = await campaignService.scheduleCampaign(id, scheduledAt, workspaceId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: 'Campaign scheduled successfully',
      data: campaign,
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    res.status(500).json({ error: 'Failed to schedule campaign', details: error.message });
  }
}

/**
 * GET /api/campaigns/:id/analytics
 * Get campaign analytics
 */
async function analytics(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const stats = await campaignService.getCampaignAnalytics(id, workspaceId);

    if (!stats) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  send,
  schedule,
  analytics,
};
