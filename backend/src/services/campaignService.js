const logger = require('../utils/logger');
const EmailCampaign = require('../models/EmailCampaign');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const { emailQueue } = require('../config/queues');

/**
 * Email Campaign Service
 * Handles campaign creation, scheduling, and sending
 */

class CampaignService {
  /**
   * Create a new email campaign
   */
  async createCampaign(workspaceId, data) {
    try {
      const campaign = new EmailCampaign({
        workspace: workspaceId,
        ...data,
      });

      await campaign.save();
      logger.info('Campaign created', { campaignId: campaign._id, name: data.name });
      return campaign;
    } catch (error) {
      logger.error('Error creating campaign', error);
      throw error;
    }
  }

  /**
   * Get campaign by ID with populated relations
   */
  async getCampaignById(campaignId) {
    return EmailCampaign.findById(campaignId)
      .populate('createdBy', 'email name')
      .populate('workspace', 'name');
  }

  /**
   * Get all campaigns for a workspace
   */
  async getCampaignsByWorkspace(workspaceId, filters = {}) {
    const query = { workspace: workspaceId };

    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return EmailCampaign.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.offset || 0)
      .populate('createdBy', 'name email');
  }

  /**
   * Send campaign immediately (batch processing)
   */
  async sendCampaign(campaignId) {
    try {
      const campaign = await EmailCampaign.findById(campaignId)
        .populate('contacts', '_id email firstName')
        .populate('segment');

      if (!campaign) throw new Error('Campaign not found');
      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign can only be sent from draft or scheduled status');
      }

      // Get contacts to send to
      let contactsToSend = campaign.contacts || [];

      // If segment is specified, get contacts from segment
      if (campaign.segment) {
        contactsToSend = await this.getContactsBySegment(campaign.segment);
      }

      logger.info('Starting campaign send', {
        campaignId,
        totalContacts: contactsToSend.length,
      });

      // Update campaign status
      await EmailCampaign.findByIdAndUpdate(campaignId, { status: 'sending' });

      // Create Email records and queue jobs
      const emails = [];
      const jobPromises = [];

      for (const contact of contactsToSend) {
        // Create Email record
        const email = new Email({
          campaign: campaignId,
          contact: contact._id,
          workspace: campaign.workspace,
          to: contact.email,
          subject: campaign.subject,
          body: campaign.body,
          htmlBody: campaign.body,
          status: 'pending',
        });

        await email.save();
        emails.push(email);

        // Queue job for sending (with batch delay)
        const delay = (emails.length - 1) * campaign.batchDelay;

        const job = emailQueue.add(
          {
            emailId: email._id,
            campaignId,
            contactId: contact._id,
            to: contact.email,
            subject: campaign.subject,
            body: campaign.body,
          },
          {
            delay,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );

        jobPromises.push(job);
      }

      logger.info('Campaign queued for sending', {
        campaignId,
        emailCount: emails.length,
      });

      // Update campaign with email count
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        totalSent: emails.length,
        sentAt: new Date(),
      });

      return {
        success: true,
        campaignId,
        emailsQueued: emails.length,
      };

    } catch (error) {
      logger.error('Error sending campaign', error);
      await EmailCampaign.findByIdAndUpdate(campaignId, { status: 'failed' });
      throw error;
    }
  }

  /**
   * Schedule campaign for later
   */
  async scheduleCampaign(campaignId, scheduledAt) {
    try {
      await EmailCampaign.findByIdAndUpdate(campaignId, {
        status: 'scheduled',
        scheduledAt,
      });

      logger.info('Campaign scheduled', { campaignId, scheduledAt });

      // TODO: Schedule a delayed job to trigger sending at scheduledAt time
      // For now, this is manual

      return { success: true };
    } catch (error) {
      logger.error('Error scheduling campaign', error);
      throw error;
    }
  }

  /**
   * Get contacts from a segment
   */
  async getContactsBySegment(segmentId) {
    // TODO: Implement segment filtering logic
    // This would need to parse segment.filters and query Contact model
    return [];
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const campaign = await EmailCampaign.findById(campaignId);

      const emailStats = await Email.aggregate([
        { $match: { campaign: campaign._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        campaignId,
        name: campaign.name,
        status: campaign.status,
        totalSent: campaign.totalSent,
        totalOpened: campaign.totalOpened,
        totalClicked: campaign.totalClicked,
        totalFailed: campaign.totalFailed,
        openRate: campaign.totalSent > 0
          ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(2)
          : 0,
        clickRate: campaign.totalSent > 0
          ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(2)
          : 0,
        emailStats,
        createdAt: campaign.createdAt,
        sentAt: campaign.sentAt,
      };
    } catch (error) {
      logger.error('Error getting campaign analytics', error);
      throw error;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, updates) {
    try {
      const campaign = await EmailCampaign.findByIdAndUpdate(
        campaignId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      logger.info('Campaign updated', { campaignId });
      return campaign;
    } catch (error) {
      logger.error('Error updating campaign', error);
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId) {
    try {
      // Delete campaign and associated emails
      await Promise.all([
        EmailCampaign.findByIdAndDelete(campaignId),
        Email.deleteMany({ campaign: campaignId }),
      ]);

      logger.info('Campaign deleted', { campaignId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting campaign', error);
      throw error;
    }
  }
}

module.exports = new CampaignService();
