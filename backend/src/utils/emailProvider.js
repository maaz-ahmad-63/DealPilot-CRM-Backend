const logger = require('./logger');

/**
 * Email Provider Wrapper
 * Supports: SendGrid, AWS SES, Mailgun
 * Can switch providers via environment variable
 */

const PROVIDER = process.env.EMAIL_PROVIDER || 'mock';

// Mock provider (for testing/development without API keys)
const mockProvider = {
  sendEmail: async ({ to, subject, body }) => {
    logger.info('MOCK: Sending email', { to, subject });
    return {
      messageId: `mock_${Date.now()}`,
      provider: 'mock',
      status: 'sent',
    };
  },
};

// SendGrid provider
const sendgridProvider = {
  sendEmail: async ({ to, subject, body, campaignId }) => {
    // TODO: Implement SendGrid API
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = { to, subject, html: body };
    // const result = await sgMail.send(msg);
    // return { messageId: result[0].headers['x-message-id'], provider: 'sendgrid' };
    throw new Error('SendGrid provider not yet implemented');
  },
};

// AWS SES provider
const sesProvider = {
  sendEmail: async ({ to, subject, body, campaignId }) => {
    // TODO: Implement AWS SES
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES();
    // const params = { Destination: { ToAddresses: [to] }, Message: {...} };
    // const result = await ses.sendEmail(params).promise();
    // return { messageId: result.MessageId, provider: 'ses' };
    throw new Error('AWS SES provider not yet implemented');
  },
};

// Select provider
const providers = {
  mock: mockProvider,
  sendgrid: sendgridProvider,
  ses: sesProvider,
};

const activeProvider = providers[PROVIDER] || mockProvider;

module.exports = activeProvider;
