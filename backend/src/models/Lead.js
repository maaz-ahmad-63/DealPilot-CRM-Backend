const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },

  // Lead Info
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: String,
  firstName: String,
  lastName: String,
  company: String,
  jobTitle: String,
  source: {
    type: String,
    enum: ['website', 'email', 'social_media', 'referral', 'other'],
    default: 'other',
  },

  // Lead Status
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiating', 'converted', 'rejected'],
    default: 'new',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },

  // Lead Value
  estimatedValue: Number,
  currency: {
    type: String,
    default: 'USD',
  },

  // Timeline - for meeting and interaction tracking
  timeline: [{
    id: String,
    type: {
      type: String,
      enum: ['meeting', 'email', 'call', 'note', 'interaction'],
    },
    channel: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

  // Tags and metadata
  tags: [String],
  notes: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  customFields: mongoose.Schema.Types.Mixed,

  // Metadata
  createdBy: {
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
  lastContactedAt: Date,
  nextFollowUpDate: Date,
});

module.exports = mongoose.model('Lead', leadSchema);
