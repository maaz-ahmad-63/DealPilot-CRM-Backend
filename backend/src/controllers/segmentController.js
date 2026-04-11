const ContactSegment = require('../models/ContactSegment');
const contactService = require('../services/contactService');
const { validationResult } = require('express-validator');

/**
 * Contact Segment Controller - HTTP handlers for segments
 */

/**
 * POST /api/segments
 * Create a new contact segment
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

    const { name, description, filters } = req.body;
    const userId = req.user?._id || req.query.userId;

    const segment = new ContactSegment({
      name,
      description,
      filters: filters || [],
      workspace: workspaceId,
      createdBy: userId,
    });

    await segment.save();

    res.status(201).json({
      success: true,
      message: 'Segment created successfully',
      data: segment,
    });
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({ error: 'Failed to create segment', details: error.message });
  }
}

/**
 * GET /api/segments
 * Get all segments for workspace
 */
async function getAll(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const segments = await ContactSegment.find({ workspace: workspaceId })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ContactSegment.countDocuments({ workspace: workspaceId });

    res.json({
      success: true,
      data: segments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ error: 'Failed to fetch segments', details: error.message });
  }
}

/**
 * GET /api/segments/:id
 * Get single segment
 */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const segment = await ContactSegment.findOne({ _id: id, workspace: workspaceId });

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({
      success: true,
      data: segment,
    });
  } catch (error) {
    console.error('Error fetching segment:', error);
    res.status(500).json({ error: 'Failed to fetch segment', details: error.message });
  }
}

/**
 * GET /api/segments/:id/contacts
 * Get contacts in a segment
 */
async function getContacts(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const segment = await ContactSegment.findOne({ _id: id, workspace: workspaceId });

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Get contacts with this segment
    const contacts = await contactService.getContacts(
      workspaceId,
      { segment: id },
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.json({
      success: true,
      segment,
      data: contacts.contacts,
      pagination: {
        total: contacts.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(contacts.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching segment contacts:', error);
    res.status(500).json({ error: 'Failed to fetch segment contacts', details: error.message });
  }
}

/**
 * PUT /api/segments/:id
 * Update segment
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const segment = await ContactSegment.findOneAndUpdate(
      { _id: id, workspace: workspaceId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({
      success: true,
      message: 'Segment updated successfully',
      data: segment,
    });
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({ error: 'Failed to update segment', details: error.message });
  }
}

/**
 * DELETE /api/segments/:id
 * Delete segment
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const segment = await ContactSegment.findOneAndDelete({ _id: id, workspace: workspaceId });

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({ error: 'Failed to delete segment', details: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getContacts,
  update,
  remove,
};
