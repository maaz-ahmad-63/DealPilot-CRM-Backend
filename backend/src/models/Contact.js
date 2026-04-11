const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },

  // Contact Info
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: String,
  firstName: String,
  lastName: String,
  company: String,

  // Metadata
  tags: [String],
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactSegment',
  },
  notes: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  customFields: mongoose.Schema.Types.Mixed,

  // Engagement Tracking
  emailsSent: {
    type: Number,
    default: 0,
  },
  emailsOpened: {
    type: Number,
    default: 0,
  },
  emailsClicked: {
    type: Number,
    default: 0,
  },
  lastEngagement: Date,

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'unsubscribed', 'bounced'],
    default: 'active',
  },
  source: String,

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
contactSchema.index({ workspace: 1, email: 1 });
contactSchema.index({ workspace: 1, segment: 1 });
contactSchema.index({ workspace: 1, tags: 1 });
contactSchema.index({ workspace: 1, status: 1 });

module.exports = mongoose.model('Contact', contactSchema);
