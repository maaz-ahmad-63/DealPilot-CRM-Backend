const mongoose = require('mongoose');

const contactSegmentSchema = new mongoose.Schema({
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

  // Filtering Rules
  filters: [{
    field: {
      type: String,
      enum: ['status', 'tags', 'emailsSent', 'lastEngagement', 'source', 'customField'],
    },
    operator: {
      type: String,
      enum: ['eq', 'ne', 'in', 'nin', 'gt', 'lt', 'gte', 'lte', 'contains', 'regex'],
    },
    value: mongoose.Schema.Types.Mixed,
  }],

  // Cached count
  contactCount: {
    type: Number,
    default: 0,
  },

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
});

contactSegmentSchema.index({ workspace: 1 });

module.exports = mongoose.model('ContactSegment', contactSegmentSchema);
