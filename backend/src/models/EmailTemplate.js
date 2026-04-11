const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  description: String,

  // Template Content
  subject: String,
  body: String,
  htmlBody: String,

  // Metadata
  category: {
    type: String,
    enum: ['welcome', 'followup', 'promotional', 'transactional', 'custom'],
    default: 'custom',
  },

  // Variables (e.g., {{firstName}}, {{companyName}})
  variables: [String],

  // Preview
  preview: String,

  // Access
  isPublic: {
    type: Boolean,
    default: false,
  },
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
});

emailTemplateSchema.index({ workspace: 1, category: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
