const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');

// Create a new meeting
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, date, duration, attendees, location, meetingLink, leadId, notes } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const meeting = new Meeting({
      title,
      description: description || '',
      type: type || 'video-call',
      date: new Date(date),
      duration: duration || 30,
      attendees: attendees || [],
      location: location || '',
      meetingLink: meetingLink || '',
      leadId: leadId || null,
      notes: notes || '',
      createdBy: req.user.id,
      status: 'scheduled',
    });

    await meeting.save();

    // If linked to a lead, add meeting to lead's timeline
    if (leadId) {
      await Lead.findByIdAndUpdate(
        leadId,
        {
          $push: {
            timeline: {
              id: `timeline_meeting_${meeting._id}`,
              type: 'meeting',
              channel: 'meeting',
              description: title,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );
    }

    res.status(201).json({ message: 'Meeting created successfully', meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all meetings for the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, leadId, fromDate, toDate } = req.query;

    const filter = { createdBy: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (leadId) {
      filter.leadId = leadId;
    }

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    const meetings = await Meeting.find(filter)
      .populate('leadId', 'firstName lastName')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single meeting
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    }).populate('leadId', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a meeting
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const updateFields = ['title', 'description', 'type', 'date', 'duration', 'attendees', 'location', 'meetingLink', 'notes', 'status', 'recordingUrl', 'attendanceNotes'];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    await meeting.save();

    res.json({ message: 'Meeting updated successfully', meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a meeting
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming meetings (next 7 days)
router.get('/upcoming/7days', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const meetings = await Meeting.find({
      createdBy: req.user.id,
      status: 'scheduled',
      date: { $gte: now, $lte: sevenDaysLater },
    })
      .populate('leadId', 'firstName lastName')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark meeting as completed
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      {
        status: 'completed',
        attendanceNotes: req.body.notes || '',
      },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ message: 'Meeting marked as completed', meeting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
