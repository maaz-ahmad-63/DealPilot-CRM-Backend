const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },

  // Email Content
  to: {
    type: String,
    required: true,
    lowercase: true,
  },
  subject: String,
  body: String,
  htmlBody: String,

  // Sending Status
  status: {
    type: String,
    enum: ['pending', 'sending', 'sent', 'failed', 'bounced', 'opened', 'clicked'],
    default: 'pending',
  },
  provider: {
    type: String,
    enum: ['sendgrid', 'ses', 'mailgun', 'mock'],
    default: 'mock',
  },
  providerMessageId: String,

  // Error Tracking
  error: String,
  retries: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },

  // Engagement
  openedAt: Date,
  clickedAt: Date,
  opens: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sentAt: Date,
  failedAt: Date,
});

// Indexes for quick lookups
emailSchema.index({ workspace: 1, status: 1 });
emailSchema.index({ campaign: 1, status: 1 });
emailSchema.index({ contact: 1, status: 1 });
emailSchema.index({ workspace: 1, createdAt: -1 });
emailSchema.index({ providerMessageId: 1 });

module.exports = mongoose.model('Email', emailSchema);
