const mongoose = require('mongoose');

const socialMediaPostSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialMediaAccount',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mediaUrls: [
      {
        type: String,
      },
    ],
    scheduledTime: {
      type: Date,
      required: true,
    },
    postedTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'posted', 'failed', 'cancelled'],
      default: 'draft',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'leads', 'customers', 'prospects'],
      default: 'all',
    },
    selectedLeads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
      },
    ],
    engagementTarget: {
      type: String,
      enum: ['awareness', 'engagement', 'conversion'],
      default: 'awareness',
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
    },
    postUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    hashtags: [String],
    mentions: [String],
  },
  { timestamps: true }
);

// Index for scheduled posts
socialMediaPostSchema.index({ scheduledTime: 1, status: 1 });
socialMediaPostSchema.index({ accountId: 1 });
socialMediaPostSchema.index({ createdBy: 1 });

module.exports = mongoose.model('SocialMediaPost', socialMediaPostSchema);
