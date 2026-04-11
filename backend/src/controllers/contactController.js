const contactService = require('../services/contactService');
const { validationResult } = require('express-validator');
const csvParser = require('csv-parser');
const fs = require('fs');

/**
 * Contact Controller - HTTP handlers for contacts
 */

/**
 * POST /api/contacts
 * Create a new contact
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

    const contact = await contactService.createContact(
      { ...req.body, workspace: workspaceId },
      workspaceId
    );

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact', details: error.message });
  }
}

/**
 * GET /api/contacts
 * Get all contacts with filtering
 */
async function getAll(req, res) {
  try {
    const { status, tags, segment, search, page = 1, limit = 20 } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const filters = {
      status,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      segment,
      search,
    };

    const contacts = await contactService.getContacts(
      workspaceId,
      filters,
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.json({
      success: true,
      data: contacts.contacts,
      pagination: {
        total: contacts.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(contacts.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts', details: error.message });
  }
}

/**
 * GET /api/contacts/:id
 * Get single contact
 */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const contact = await contactService.getContactById(id, workspaceId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact', details: error.message });
  }
}

/**
 * PUT /api/contacts/:id
 * Update contact
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const contact = await contactService.updateContact(id, req.body, workspaceId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact', details: error.message });
  }
}

/**
 * DELETE /api/contacts/:id
 * Delete contact
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const result = await contactService.deleteContact(id, workspaceId);

    if (!result) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact', details: error.message });
  }
}

/**
 * POST /api/contacts/import
 * Bulk import contacts from CSV
 */
async function importContacts(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workspaceId = req.workspace?._id || req.query.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const csvPath = req.file.path;
    const contacts = [];

    // Parse CSV file
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => {
        contacts.push(data);
      })
      .on('end', async () => {
        try {
          const result = await contactService.bulkImportContacts(contacts, workspaceId);

          // Clean up uploaded file
          fs.unlinkSync(csvPath);

          res.json({
            success: true,
            message: 'Contacts imported successfully',
            data: {
              total: result.total,
              successful: result.successful,
              failed: result.failed,
              errors: result.errors,
            },
          });
        } catch (error) {
          console.error('Error importing contacts:', error);
          fs.unlinkSync(csvPath);
          res.status(500).json({ error: 'Failed to import contacts', details: error.message });
        }
      });
  } catch (error) {
    console.error('Error in import handler:', error);
    res.status(500).json({ error: 'Failed to process import', details: error.message });
  }
}

/**
 * GET /api/contacts/export
 * Export contacts as CSV
 */
async function exportContacts(req, res) {
  try {
    const { status, tags, segment } = req.query;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const filters = {
      status,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      segment,
    };

    const csv = await contactService.exportContacts(workspaceId, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts', details: error.message });
  }
}

/**
 * POST /api/contacts/:id/notes
 * Add note to contact
 */
async function addNote(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    const contact = await contactService.addNote(id, text, workspaceId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note', details: error.message });
  }
}

/**
 * POST /api/contacts/:id/tags
 * Add tags to contact
 */
async function addTags(req, res) {
  try {
    const { id } = req.params;
    const { tags } = req.body;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const contact = await contactService.addTags(id, tags, workspaceId);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      message: 'Tags added successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Error adding tags:', error);
    res.status(500).json({ error: 'Failed to add tags', details: error.message });
  }
}

/**
 * GET /api/contacts/:id/stats
 * Get contact engagement stats
 */
async function getStats(req, res) {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?._id || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const stats = await contactService.getContactStats(id, workspaceId);

    if (!stats) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  importContacts,
  exportContacts,
  addNote,
  addTags,
  getStats,
};
