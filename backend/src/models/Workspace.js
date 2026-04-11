const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Billing
  stripeCustomerId: String,
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },

  // Limits
  emailLimit: {
    type: Number,
    default: 500, // 500 free, unlimited pro
  },
  emailUsed: {
    type: Number,
    default: 0,
  },
  contactLimit: {
    type: Number,
    default: 1000,
  },
  campaignLimit: {
    type: Number,
    default: 10,
  },

  // Settings
  senderEmail: String,
  senderName: String,
  emailProvider: {
    type: String,
    enum: ['sendgrid', 'ses', 'mailgun'],
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

module.exports = mongoose.model('Workspace', workspaceSchema);
