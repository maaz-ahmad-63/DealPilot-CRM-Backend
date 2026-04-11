const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'send', 'import', 'export', 'login'],
  },
  resource: {
    type: String,
    enum: ['contact', 'campaign', 'template', 'segment', 'user'],
  },
  resourceId: mongoose.Schema.Types.ObjectId,

  // Changes tracking
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },

  // Request context
  ipAddress: String,
  userAgent: String,

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000, // 90 days TTL
  },
});

auditLogSchema.index({ workspace: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
