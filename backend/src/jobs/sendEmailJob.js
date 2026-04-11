const logger = require('../utils/logger');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const emailProvider = require('../utils/emailProvider');

/**
 * Email queue job processor
 * Handles individual email sending with retry logic
 */
async function processSendEmailJob(job) {
  const { emailId, campaignId, contactId, to, subject, body, retryCount = 0 } = job.data;
  const MAX_RETRIES = 3;

  try {
    logger.info('Processing email job', { emailId, to, campaignId });

    // Update status to sending
    await Email.findByIdAndUpdate(emailId, { status: 'sending' });

    // Send email via provider
    const result = await emailProvider.sendEmail({
      to,
      subject,
      body,
      campaignId,
    });

    // Update email record with success
    await Email.findByIdAndUpdate(emailId, {
      status: 'sent',
      sentAt: new Date(),
      providerMessageId: result.messageId,
      provider: result.provider,
    });

    // Update contact engagement metrics
    await Contact.findByIdAndUpdate(contactId, {
      $inc: { emailsSent: 1 },
      lastEngagement: new Date(),
    });

    logger.info('Email sent successfully', { emailId, messageId: result.messageId });
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Email sending failed', {
      emailId,
      to,
      attempt: retryCount + 1,
      error: error.message,
    });

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      const retryDelay = Math.pow(2, retryCount) * 5000; // Exponential backoff: 5s, 10s, 20s

      logger.info('Retrying email', {
        emailId,
        nextRetry: new Date(Date.now() + retryDelay),
      });

      await Email.findByIdAndUpdate(emailId, {
        $inc: { retries: 1 },
        error: error.message,
      });

      // Throw error to trigger retry
      throw new Error(`Send failed - will retry. Error: ${error.message}`);
    } else {
      // Max retries exceeded - mark as failed
      await Email.findByIdAndUpdate(emailId, {
        status: 'failed',
        error: error.message,
        failedAt: new Date(),
        $inc: { retries: 1 },
      });

      logger.error('Email max retries exceeded', { emailId, error: error.message });
      throw error; // Still throw to mark job as failed
    }
  }
}

module.exports = processSendEmailJob;
