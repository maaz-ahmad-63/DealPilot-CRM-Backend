const EmailTemplate = require('../models/EmailTemplate');
const { validationResult } = require('express-validator');

/**
 * Email Template Controller - HTTP handlers for email templates
 */

/**
 * POST /api/templates
 * Create a new email template
 */
async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workspaceId = req.workspace?._id || req.query.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const { name, subject, body, htmlBody, variables, category } = req.body;
    const userId = req.user?._id || req.query.userId;

    const template = new EmailTemplate({
      name,
      subject,
      body,
      htmlBody,
      variables: variables || [],
      category: category || 'custom',
      workspace: workspaceId,
      createdBy: userId,
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template', details: error.message });
  }
}

/**
 * GET /api/templates
 * Get all templates for workspace
 */
async function getAll(req, res) {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const query = { workspace: workspaceId };
    if (category) query.category = category;

    const templates = await EmailTemplate.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EmailTemplate.countDocuments(query);

    res.json({
      success: true,
      data: templates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
  }
}

/**
 * GET /api/templates/:id
 * Get single template
 */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const template = await EmailTemplate.findOne({ _id: id, workspace: workspaceId });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template', details: error.message });
  }
}

/**
 * PUT /api/templates/:id
 * Update template
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const template = await EmailTemplate.findOneAndUpdate(
      { _id: id, workspace: workspaceId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template', details: error.message });
  }
}

/**
 * DELETE /api/templates/:id
 * Delete template
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const template = await EmailTemplate.findOneAndDelete({ _id: id, workspace: workspaceId });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template', details: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
};
