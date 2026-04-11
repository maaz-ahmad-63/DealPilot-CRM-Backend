const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['video-call', 'in-person', 'phone'],
      default: 'video-call',
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    attendees: [
      {
        type: String, // Team member names
      },
    ],
    location: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    attendanceNotes: {
      type: String,
      default: '',
    },
    followUpTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    reminders: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: Number, // minutes before meeting
      default: 15,
    },
  },
  { timestamps: true }
);

// Index for upcoming meetings
meetingSchema.index({ date: 1, status: 1 });
meetingSchema.index({ leadId: 1 });
meetingSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
