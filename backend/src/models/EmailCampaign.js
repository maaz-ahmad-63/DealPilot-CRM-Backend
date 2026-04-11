const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },

  // Basics
  name: {
    type: String,
    required: true,
  },
  description: String,

  // Content
  subject: String,
  body: String,
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
  },

  // Audience
  contacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  }],
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactSegment',
  },

  // Scheduling
  scheduledAt: Date,
  sentAt: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'],
    default: 'draft',
  },

  // Analytics
  totalSent: {
    type: Number,
    default: 0,
  },
  totalFailed: {
    type: Number,
    default: 0,
  },
  totalOpened: {
    type: Number,
    default: 0,
  },
  totalClicked: {
    type: Number,
    default: 0,
  },

  // Sending Config
  sendType: {
    type: String,
    enum: ['immediate', 'scheduled', 'batch'],
    default: 'immediate',
  },
  batchSize: {
    type: Number,
    default: 100,
  },
  batchDelay: {
    type: Number,
    default: 1000, // 1 second between batches
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
emailCampaignSchema.index({ workspace: 1, status: 1 });
emailCampaignSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
