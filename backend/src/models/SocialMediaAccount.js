const mongoose = require('mongoose');

const socialMediaAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'],
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountHandle: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      // Encrypted in production
    },
    refreshToken: {
      type: String,
      default: '',
    },
    connected: {
      type: Boolean,
      default: true,
    },
    followers: {
      type: Number,
      default: 0,
    },
    engagement: {
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalShares: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 }, // percentage
    },
    lastSyncDate: {
      type: Date,
      default: null,
    },
    lastPostDate: {
      type: Date,
      default: null,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      profilePicture: String,
      bio: String,
      website: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialMediaAccount', socialMediaAccountSchema);
