const express = require('express');
const router = express.Router();
const SocialMediaAccount = require('../models/SocialMediaAccount');
const SocialMediaPost = require('../models/SocialMediaPost');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');

// ========== ACCOUNT MANAGEMENT ==========

// Connect a social media account
router.post('/accounts', authenticateToken, async (req, res) => {
  try {
    const { platform, accountName, accountHandle, accessToken } = req.body;

    if (!platform || !accountName || !accessToken) {
      return res.status(400).json({ error: 'Platform, account name, and access token are required' });
    }

    const account = new SocialMediaAccount({
      platform,
      accountName,
      accountHandle: accountHandle || accountName,
      userId: req.user.id,
      accessToken, // In production, encrypt this
      connected: true,
    });

    await account.save();
    res.status(201).json({ message: 'Account connected successfully', account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all connected accounts for the user
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find({
      userId: req.user.id,
    }).select('-accessToken -refreshToken');

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get accounts by platform
router.get('/accounts/:platform', authenticateToken, async (req, res) => {
  try {
    const accounts = await SocialMediaAccount.find({
      userId: req.user.id,
      platform: req.params.platform,
    }).select('-accessToken -refreshToken');

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect a social media account
router.delete('/accounts/:id', authenticateToken, async (req, res) => {
  try {
    const account = await SocialMediaAccount.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== POST MANAGEMENT ==========

// Create a new social media post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { accountId, content, mediaUrls, scheduledTime, targetAudience, selectedLeads, engagementTarget, hashtags } = req.body;

    if (!accountId || !content || !scheduledTime) {
      return res.status(400).json({ error: 'Account, content, and scheduled time are required' });
    }

    // Verify account belongs to user
    const account = await SocialMediaAccount.findOne({
      _id: accountId,
      userId: req.user.id,
    });

    if (!account) {
      return res.status(403).json({ error: 'Account not found or unauthorized' });
    }

    const post = new SocialMediaPost({
      platform: account.platform,
      accountId,
      content,
      mediaUrls: mediaUrls || [],
      scheduledTime: new Date(scheduledTime),
      targetAudience: targetAudience || 'all',
      selectedLeads: selectedLeads || [],
      engagementTarget: engagementTarget || 'awareness',
      hashtags: hashtags || [],
      createdBy: req.user.id,
      status: 'scheduled',
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts for the user
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { status, platform, fromDate, toDate } = req.query;

    const filter = { createdBy: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (platform) {
      filter.platform = platform;
    }

    if (fromDate || toDate) {
      filter.scheduledTime = {};
      if (fromDate) filter.scheduledTime.$gte = new Date(fromDate);
      if (toDate) filter.scheduledTime.$lte = new Date(toDate);
    }

    const posts = await SocialMediaPost.find(filter)
      .populate('accountId', 'platform accountName')
      .populate('selectedLeads', 'firstName lastName')
      .sort({ scheduledTime: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post
router.get('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await SocialMediaPost.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    })
      .populate('accountId')
      .populate('selectedLeads', 'firstName lastName');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a post (only drafts and scheduled)
router.patch('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await SocialMediaPost.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!['draft', 'scheduled'].includes(post.status)) {
      return res.status(400).json({ error: 'Only drafts and scheduled posts can be edited' });
    }

    const updateFields = ['content', 'mediaUrls', 'scheduledTime', 'targetAudience', 'selectedLeads', 'engagementTarget', 'hashtags', 'status'];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a post
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await SocialMediaPost.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming scheduled posts
router.get('/posts/upcoming/7days', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const posts = await SocialMediaPost.find({
      createdBy: req.user.id,
      status: 'scheduled',
      scheduledTime: { $gte: now, $lte: sevenDaysLater },
    })
      .populate('accountId', 'platform accountName')
      .sort({ scheduledTime: 1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish a post immediately (for draft posts)
router.post('/posts/:id/publish', authenticateToken, async (req, res) => {
  try {
    const post = await SocialMediaPost.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      status: 'draft',
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or not a draft' });
    }

    // TODO: Implement actual posting to social media platform
    // For now, just mark as posted
    post.status = 'posted';
    post.postedTime = new Date();

    await post.save();

    // If linked to leads, create timeline events
    if (post.selectedLeads && post.selectedLeads.length > 0) {
      const leadUpdate = {
        $push: {
          timeline: {
            id: `timeline_post_${post._id}`,
            type: 'followup_scheduled',
            channel: post.platform,
            description: `Social media post: ${post.content.substring(0, 100)}...`,
            timestamp: new Date(),
          },
        },
      };
      await Lead.updateMany({ _id: { $in: post.selectedLeads } }, leadUpdate);
    }

    res.json({ message: 'Post published successfully', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get engagement analytics for posts
router.get('/posts/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const post = await SocialMediaPost.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const analytics = {
      likes: post.engagement.likes,
      comments: post.engagement.comments,
      shares: post.engagement.shares,
      views: post.engagement.views,
      clicks: post.engagement.clicks,
      engagementRate: post.engagement.engagementRate,
      totalEngagements: post.engagement.likes + post.engagement.comments + post.engagement.shares,
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
