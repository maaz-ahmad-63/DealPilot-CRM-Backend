// Multi-Source Lead Handler - API Routes
const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

// ============================================
// WEBSITE FORM - Receive leads from website
// ============================================

/**
 * POST /api/leads/sources/website-form
 * Receive lead from website form submission
 */
router.post('/sources/website-form', authMiddleware, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      message,
      formData
    } = req.body;
    
    const userId = req.user._id;

    // Validate required fields
    if (!firstName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name and email are required'
      });
    }

    // Check for duplicate (same email)
    const existingLead = await Lead.findOne({ email, source: 'website-form' });
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'Lead already exists with this email',
        leadId: existingLead._id
      });
    }

    // Create new lead
    const lead = new Lead({
      firstName,
      lastName,
      email,
      phone,
      company,
      source: 'website-form',
      sourceId: email, // Use email as unique identifier
      message,
      formData,
      channels: {
        email,
        website: true
      },
      userId,
      status: 'new',
      tags: ['website-form-submission']
    });

    await lead.save();

    // Auto-reply (send via email service)
    // TODO: Integrate with email service to send confirmation

    res.status(201).json({
      success: true,
      message: 'Lead created successfully from website form',
      lead: {
        id: lead._id,
        fullName: lead.fullName,
        email: lead.email,
        source: lead.source,
        createdAt: lead.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating lead from website form:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
});

// ============================================
// WHATSAPP - Webhook receiver
// ============================================

/**
 * POST /api/leads/sources/whatsapp/webhook
 * Receive WhatsApp messages via webhook
 * This webhook receives incoming messages and converts them to leads
 */
router.post('/sources/whatsapp/webhook', async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'No messages received' });
    }
    
    // Use provided userId or fall back to environment variable for webhook calls
    const defaultUserId = userId || process.env.DEFAULT_USER_ID;
    const results = [];

    for (const msg of messages) {
      const {
        from,
        body,
        name,
        profile_name,
        timestamp
      } = msg;

      if (!from || !body) continue;

      try {
        // Check if lead already exists
        let lead = await Lead.findOne({
          'channels.whatsapp': from,
          source: 'whatsapp'
        });

        if (!lead) {
          // Create new lead
          lead = new Lead({
            firstName: name || profile_name || 'WhatsApp User',
            lastName: '',
            phone: from,
            source: 'whatsapp',
            sourceId: from,
            channels: {
              whatsapp: from
            },
            message: body,
            userId: defaultUserId,
            status: 'new',
            tags: ['whatsapp-inbound'],
            sourceData: {
              messageBody: body,
              profileName: profile_name,
              timestamp: new Date(parseInt(timestamp) * 1000)
            }
          });

          await lead.save();
          results.push({
            status: 'created',
            leadId: lead._id,
            phone: from
          });
        } else {
          // Update existing lead with new message
          lead.conversationHistory.push({
            timestamp: new Date(parseInt(timestamp) * 1000),
            from: 'lead',
            message: body,
            type: 'manual'
          });
          lead.lastContact = new Date();
          lead.updatedAt = new Date();
          await lead.save();

          results.push({
            status: 'updated',
            leadId: lead._id,
            phone: from
          });
        }

        // TODO: Trigger automation rules (auto-reply, auto-tag, etc)
        // await triggerAutomationRules(lead, body);

      } catch (error) {
        console.error(`Error processing WhatsApp message from ${from}:`, error);
        results.push({
          status: 'error',
          phone: from,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.length} WhatsApp message(s)`,
      results
    });

  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing WhatsApp webhook',
      error: error.message
    });
  }
});

// ============================================
// INSTAGRAM - API receiver (future)
// ============================================

/**
 * POST /api/leads/sources/instagram
 * Receive Instagram Direct Messages
 */
router.post('/sources/instagram', authMiddleware, async (req, res) => {
  try {
    const {
      instagramHandle,
      message,
      senderName,
      timestamp
    } = req.body;

    const userId = req.user._id;

    if (!instagramHandle || !message) {
      return res.status(400).json({
        success: false,
        message: 'Instagram handle and message are required'
      });
    }

    // Check if lead already exists
    let lead = await Lead.findOne({
      'channels.instagram': instagramHandle,
      source: 'instagram'
    });

    if (!lead) {
      lead = new Lead({
        firstName: senderName || instagramHandle,
        lastName: '',
        source: 'instagram',
        sourceId: instagramHandle,
        channels: {
          instagram: instagramHandle
        },
        message,
        userId,
        status: 'new',
        tags: ['instagram-dm'],
        sourceData: {
          instagramHandle,
          timestamp: new Date(timestamp)
        }
      });

      await lead.save();

      res.status(201).json({
        success: true,
        message: 'Lead created from Instagram DM',
        lead: {
          id: lead._id,
          source: lead.source,
          createdAt: lead.createdAt
        }
      });
    } else {
      // Update with new message
      lead.conversationHistory.push({
        timestamp: new Date(),
        from: 'lead',
        message,
        type: 'manual'
      });
      lead.lastContact = new Date();
      await lead.save();

      res.status(200).json({
        success: true,
        message: 'Lead updated with new Instagram message',
        lead: { id: lead._id }
      });
    }

  } catch (error) {
    console.error('Error creating lead from Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Instagram lead',
      error: error.message
    });
  }
});

// ============================================
// GET ALL LEADS (Unified Dashboard)
// ============================================

/**
 * GET /api/leads
 * Get all leads across all sources with filtering
 */
router.get('/',authMiddleware, async (req, res) => {
  try {
    const {
      source,
      status,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    // Build filter query
    const filter = { userId: req.user._id };

    if (source) filter.source = source;
    if (status) filter.status = status;
    if (tags) filter.tags = { $in: tags.split(',') };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Lead.countDocuments(filter);

    // Get leads
    const leads = await Lead.find(filter)
      .sort({ [sortBy]: parseInt(sortOrder) })
      .skip(skip)
      .limit(parseInt(limit));

    // Get stats by source
    const statsBySource = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        stats: {
          bySource: statsBySource
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
});

// ============================================
// GET LEAD STATS
// ============================================

/**
 * GET /api/leads/stats/dashboard
 * Get dashboard statistics
 */
router.get('/stats/dashboard',authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Total leads
    const total = await Lead.countDocuments({ userId });

    // By status
    const byStatus = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // By source
    const bySource = await Lead.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysLeads = await Lead.countDocuments({
      userId,
      createdAt: { $gte: today }
    });

    // Conversion rate
    const converted = await Lead.countDocuments({
      userId,
      status: 'customer'
    });
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        total,
        todaysLeads,
        converted,
        conversionRate: `${conversionRate}%`,
        byStatus: Object.fromEntries(
          byStatus.map(item => [item._id, item.count])
        ),
        bySource: Object.fromEntries(
          bySource.map(item => [item._id, item.count])
        )
      }
    });

  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// ============================================
// UPDATE LEAD
// ============================================

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put('/:id',authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent changing source directly
    delete updates.source;
    delete updates.userId;

    const lead = await Lead.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
});

// ============================================
// DELETE LEAD
// ============================================

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete('/:id',authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
});

module.exports = router;
