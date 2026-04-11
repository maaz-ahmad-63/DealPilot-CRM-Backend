import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, Clock, Users, Video, MapPin, Edit2, Trash2, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyMeeting = {
  title: '',
  description: '',
  type: 'video-call', // video-call, in-person, phone
  date: '',
  time: '',
  duration: 30, // minutes
  attendees: [],
  location: '',
  meetingLink: '',
  leadId: '',
  notes: '',
  status: 'scheduled', // scheduled, in-progress, completed, cancelled
};

const MEETING_TYPES = [
  { value: 'video-call', label: 'Video Call', icon: '📹' },
  { value: 'in-person', label: 'In-Person', icon: '🤝' },
  { value: 'phone', label: 'Phone Call', icon: '☎️' },
];

export function Meetings() {
  const { addNotification } = useNotification();
  const { teamMembers, leadIntelligence } = useCRM();
  const [meetings, setMeetings] = useState([
    {
      id: 'meeting_1',
      title: 'Product Demo - Acme Corp',
      description: 'Full product walkthrough with buying committee',
      type: 'video-call',
      date: '2026-04-15',
      time: '10:00',
      duration: 60,
      attendees: ['John Smith', 'Alex Morgan', 'Sarah Johnson'],
      location: '',
      meetingLink: 'https://zoom.us/j/123456789',
      leadId: 'lead_1',
      notes: 'Focus on automation features and ROI',
      status: 'scheduled',
    },
    {
      id: 'meeting_2',
      title: 'Contract Review - Tech Solutions',
      description: 'Review contract terms with legal team',
      type: 'in-person',
      date: '2026-04-16',
      time: '14:30',
      duration: 45,
      attendees: ['Sarah Johnson', 'Priya Sharma'],
      location: 'Conference Room B',
      meetingLink: '',
      leadId: 'lead_2',
      notes: 'Have payment terms discussion ready',
      status: 'scheduled',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [form, setForm] = useState(emptyMeeting);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  // Filter meetings
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => filterStatus === 'all' || m.status === filterStatus)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  }, [meetings, filterStatus]);

  // Upcoming meetings (next 7 days)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return filteredMeetings.filter((m) => {
      const meetingDate = new Date(`${m.date}T${m.time}`);
      return meetingDate >= now && meetingDate <= sevenDaysLater && m.status === 'scheduled';
    });
  }, [filteredMeetings]);

  const openModal = (meeting = null) => {
    setEditingMeeting(meeting);
    if (meeting) {
      setForm({ ...meeting });
      setSelectedAttendees(meeting.attendees);
    } else {
      setForm(emptyMeeting);
      setSelectedAttendees([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingMeeting(null);
    setForm(emptyMeeting);
    setSelectedAttendees([]);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.title || !form.date || !form.time) {
      addNotification('Please fill in all required fields', 'warning');
      return;
    }

    if (editingMeeting) {
      setMeetings(meetings.map((m) =>
        m.id === editingMeeting.id
          ? { ...form, id: editingMeeting.id, attendees: selectedAttendees }
          : m
      ));
      addNotification('Meeting updated successfully', 'success');
    } else {
      const newMeeting = {
        ...form,
        id: `meeting_${Date.now()}`,
        attendees: selectedAttendees,
      };
      setMeetings([...meetings, newMeeting]);
      addNotification('Meeting created successfully', 'success');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setMeetings(meetings.filter((m) => m.id !== id));
    addNotification('Meeting deleted', 'success');
  };

  const toggleAttendee = (attendee) => {
    if (selectedAttendees.includes(attendee)) {
      setSelectedAttendees(selectedAttendees.filter((a) => a !== attendee));
    } else {
      setSelectedAttendees([...selectedAttendees, attendee]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    return MEETING_TYPES.find((t) => t.value === type)?.icon || '📅';
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Scheduler</h1>
          <p className="text-gray-600 mt-2">Schedule and manage meetings with team members and leads</p>
        </motion.div>

        {/* Upcoming Meetings Alert */}
        {upcomingMeetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
          >
            <Bell size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                📅 {upcomingMeetings.length} meeting{upcomingMeetings.length > 1 ? 's' : ''} in next 7 days
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {upcomingMeetings.map((m) => m.title).join(', ')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={18} />
            Schedule Meeting
          </motion.button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Meetings</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </motion.div>

        {/* Meetings Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredMeetings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-gray-500 text-lg">No meetings scheduled</p>
            </div>
          ) : (
            filteredMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(meeting.type)}</span>
                      <h3 className="font-bold text-gray-900">{meeting.title}</h3>
                    </div>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(meeting)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(meeting.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {meeting.description && (
                  <p className="text-sm text-gray-600 mb-4">{meeting.description}</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>
                      {new Date(`${meeting.date}T${meeting.time}`).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {meeting.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{meeting.duration} minutes</span>
                  </div>

                  {meeting.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{meeting.location}</span>
                    </div>
                  )}

                  {meeting.meetingLink && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video size={16} className="text-blue-600" />
                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Join Video Call
                      </a>
                    </div>
                  )}
                </div>

                {meeting.attendees.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Attendees</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meeting.attendees.map((attendee, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      <span className="font-medium">Notes:</span> {meeting.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Meeting Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Meeting title"
                  className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Meeting description (optional)"
                  className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />

                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MEETING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="number"
                  min="5"
                  max="480"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  placeholder="Duration (minutes)"
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Location (for in-person)"
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                {form.type === 'video-call' && (
                  <input
                    value={form.meetingLink}
                    onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                    placeholder="Meeting link (Zoom, Teams, etc.)"
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Meeting notes (optional)"
                  className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Attendees</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                    {teamMembers.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(member.name)}
                          onChange={() => toggleAttendee(member.name)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
