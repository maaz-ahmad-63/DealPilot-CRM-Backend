const logger = require('../utils/logger');
const Contact = require('../models/Contact');

/**
 * Contact Service
 * Handles contact CRUD, import, segmentation
 */

class ContactService {
  /**
   * Create a single contact
   */
  async createContact(workspaceId, data) {
    try {
      const contact = new Contact({
        workspace: workspaceId,
        ...data,
      });

      await contact.save();
      logger.info('Contact created', { contactId: contact._id, email: data.email });
      return contact;
    } catch (error) {
      logger.error('Error creating contact', error);
      throw error;
    }
  }

  /**
   * Bulk import contacts (CSV)
   * Format: email, firstName, lastName, company, phone, tags
   */
  async bulkImportContacts(workspaceId, contacts) {
    try {
      const importedContacts = [];
      const errors = [];

      for (let i = 0; i < contacts.length; i++) {
        try {
          const contact = new Contact({
            workspace: workspaceId,
            ...contacts[i],
          });

          await contact.save();
          importedContacts.push(contact);
        } catch (error) {
          errors.push({ row: i + 1, error: error.message });
        }
      }

      logger.info('Bulk import completed', {
        workspaceId,
        imported: importedContacts.length,
        failed: errors.length,
      });

      return {
        imported: importedContacts.length,
        failed: errors.length,
        errors,
      };
    } catch (error) {
      logger.error('Error in bulk import', error);
      throw error;
    }
  }

  /**
   * Get all contacts for workspace
   */
  async getContacts(workspaceId, filters = {}) {
    try {
      const query = { workspace: workspaceId };

      if (filters.status) query.status = filters.status;
      if (filters.tags) query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
      if (filters.segment) query.segment = filters.segment;
      if (filters.search) {
        query.$or = [
          { email: { $regex: filters.search, $options: 'i' } },
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.offset || 0);

      const total = await Contact.countDocuments(query);

      return { contacts, total };
    } catch (error) {
      logger.error('Error getting contacts', error);
      throw error;
    }
  }

  /**
   * Get single contact
   */
  async getContactById(contactId) {
    try {
      return await Contact.findById(contactId).populate('segment');
    } catch (error) {
      logger.error('Error getting contact', error);
      throw error;
    }
  }

  /**
   * Update contact
   */
  async updateContact(contactId, updates) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      logger.info('Contact updated', { contactId });
      return contact;
    } catch (error) {
      logger.error('Error updating contact', error);
      throw error;
    }
  }

  /**
   * Add note to contact
   */
  async addNote(contactId, text) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        {
          $push: {
            notes: { text, createdAt: new Date() },
          },
        },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Error adding note', error);
      throw error;
    }
  }

  /**
   * Add tags to contact
   */
  async addTags(contactId, tags) {
    try {
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        {
          $addToSet: { tags: { $each: tags } },
        },
        { new: true }
      );

      return contact;
    } catch (error) {
      logger.error('Error adding tags', error);
      throw error;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId) {
    try {
      await Contact.findByIdAndDelete(contactId);
      logger.info('Contact deleted', { contactId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting contact', error);
      throw error;
    }
  }

  /**
   * Get engagement statistics for contact
   */
  async getContactStats(contactId) {
    try {
      const contact = await Contact.findById(contactId);

      return {
        contactId,
        email: contact.email,
        emailsSent: contact.emailsSent,
        emailsOpened: contact.emailsOpened,
        emailsClicked: contact.emailsClicked,
        openRate: contact.emailsSent > 0
          ? ((contact.emailsOpened / contact.emailsSent) * 100).toFixed(2)
          : 0,
        clickRate: contact.emailsSent > 0
          ? ((contact.emailsClicked / contact.emailsSent) * 100).toFixed(2)
          : 0,
        lastEngagement: contact.lastEngagement,
      };
    } catch (error) {
      logger.error('Error getting contact stats', error);
      throw error;
    }
  }

  /**
   * Export contacts as CSV
   */
  async exportContacts(workspaceId, filters = {}) {
    try {
      const { contacts } = await this.getContacts(workspaceId, { ...filters, limit: 100000 });

      // Convert to CSV format
      const csv = this.convertToCSV(contacts);
      return csv;
    } catch (error) {
      logger.error('Error exporting contacts', error);
      throw error;
    }
  }

  /**
   * Convert contacts array to CSV
   */
  convertToCSV(contacts) {
    const headers = ['email', 'firstName', 'lastName', 'company', 'phone', 'tags', 'status'];
    const rows = contacts.map(contact => [
      contact.email,
      contact.firstName || '',
      contact.lastName || '',
      contact.company || '',
      contact.phone || '',
      contact.tags.join(';'),
      contact.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}

module.exports = new ContactService();
