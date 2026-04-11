import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Mail, Phone, Briefcase, CheckSquare, UserPlus, X, Flame, Sparkles, Clock3, Wand2, CalendarClock, MessageSquare } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyLead = {
  name: '',
  email: '',
  phone: '',
  status: 'New',
  company: '',
  value: 0,
  source: 'Manual',
  assignedTo: '',
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export function Leads() {
  const { addNotification } = useNotification();
  const {
    leadIntelligence,
    hotLeads,
    followupReminders,
    teamMembers,
    addLead,
    updateLead,
    deleteLead,
    assignLead,
    addDeal,
    addTask,
    addContact,
    scheduleFollowup,
    getLeadTimeline,
    generateSalesAssistantContent,
    createLeadFromRawInput,
    logLeadInteraction,
  } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(emptyLead);
  const [currentPage, setCurrentPage] = useState(1);
  const [rawLeadInput, setRawLeadInput] = useState('');
  const [timelineLead, setTimelineLead] = useState(null);
  const [assistantLead, setAssistantLead] = useState(null);
  const [assistantData, setAssistantData] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
  const sources = ['All', 'Manual', 'LinkedIn', 'Referral', 'Website', 'Event'];
  const itemsPerPage = 5;

  const filteredLeads = useMemo(
    () =>
      leadIntelligence.filter((lead) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query);
        const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
        const matchesSource = filterSource === 'All' || lead.source === filterSource;
        return matchesSearch && matchesStatus && matchesSource;
      }),
    [filterStatus, filterSource, leadIntelligence, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openModal = (lead = null) => {
    setEditingLead(lead);
    setForm(lead ? { ...lead } : { ...emptyLead, assignedTo: teamMembers[0]?.id || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingLead(null);
    setForm(emptyLead);
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingLead) {
      updateLead(editingLead.id, { ...form, value: Number(form.value) });
      if (form.assignedTo && form.assignedTo !== editingLead.assignedTo) {
        assignLead(editingLead.id, form.assignedTo);
      }
      addNotification('Lead updated successfully', 'success');
    } else {
      addLead({ ...form, value: Number(form.value) });
      addNotification('Lead added successfully', 'success');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    deleteLead(id);
    addNotification('Lead deleted successfully', 'success');
  };

  const createDealFromLead = (lead) => {
    addDeal({
      name: `${lead.company} Opportunity`,
      value: Number(lead.value || 0),
      stage: 'Qualification',
      owner: lead.name,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      probability: 40,
    });
    addNotification('Deal created from lead', 'success');
  };

  const createTaskFromLead = (lead) => {
    addTask({
      title: `Follow up with ${lead.name}`,
      status: 'pending',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      assignee: lead.name,
      priority: 'medium',
    });
    addNotification('Follow-up task created', 'success');
  };

  const createContactFromLead = (lead) => {
    addContact({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      city: 'Unknown',
    });
    addNotification('Contact created from lead', 'success');
  };

  const createFollowup = (lead) => {
    scheduleFollowup(lead.id, {
      channel: 'email',
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
      assigneeId: lead.assignedTo,
    });
    addNotification('Smart follow-up scheduled', 'success');
  };

  const openTimeline = (lead) => {
    setTimelineLead(lead);
  };

  const openAssistant = async (lead) => {
    setAssistantLead(lead);
    setAssistantLoading(true);
    const data = await generateSalesAssistantContent(lead.id, lead.notes || '');
    setAssistantData(data);
    setAssistantLoading(false);
  };

  const handleRawExtraction = () => {
    const parsed = createLeadFromRawInput(rawLeadInput);
    if (!parsed) {
      addNotification('Please add valid raw text for extraction', 'warning');
      return;
    }
    addNotification(`Lead extracted: ${parsed.name}`, 'success');
    setRawLeadInput('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Qualified':
        return 'bg-green-100 text-green-800';
      case 'Converted':
        return 'bg-purple-100 text-purple-800';
      case 'Lost':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-2">Capture, qualify, and convert your pipeline with AI recommendations.</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Flame size={18} className="text-orange-600" />
              Hot Leads (Score 75+)
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {hotLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-600">{lead.company}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">{lead.leadScore}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-2">Next: {lead.nextBestAction}</p>
                </div>
              ))}
              {hotLeads.length === 0 && <p className="text-sm text-gray-500">No hot leads yet.</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-purple-600" />
              Lead Source Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sources.filter((s) => s !== 'All').map((source) => {
                const count = leadIntelligence.filter((l) => l.source === source).length;
                const percentage = leadIntelligence.length > 0 ? Math.round((count / leadIntelligence.length) * 100) : 0;
                const isActive = filterSource === source;
                return (
                  <motion.div
                    key={source}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFilterSource(isActive ? 'All' : source)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{source}</p>
                    <p className="text-xs text-gray-600 mt-1">{count} leads</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="bg-blue-500 h-full"
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {followupReminders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <Clock3 size={16} />
              Follow-up Alerts ({followupReminders.length})
            </h3>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {followupReminders.slice(0, 4).map((item) => (
                <div key={item.leadId} className="rounded-lg bg-white p-3 border border-amber-100">
                  <p className="font-semibold text-sm text-gray-900">{item.leadName}</p>
                  <p className="text-xs text-gray-600">{item.company} • {item.inactivityDays} days inactive</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 bg-transparent outline-none text-gray-900"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filterSource}
                onChange={(e) => {
                  setFilterSource(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 outline-none"
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source === 'All' ? 'All Sources' : source}
                  </option>
                ))}
              </select>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Plus size={18} />
                Add Lead
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">AI Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Next Best Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Touch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quick Actions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedLeads.map((lead, index) => (
                  <motion.tr key={lead.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${lead.leadScore >= 75 ? 'bg-orange-100 text-orange-800' : lead.leadScore >= 55 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                          {lead.leadScore}
                        </span>
                        <span className="text-xs text-gray-500">{lead.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>{lead.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">{lead.source}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">{lead.nextBestAction}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teamMembers.find((member) => member.id === lead.assignedTo)?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{lead.inactivityDays === 0 ? 'Today' : `${lead.inactivityDays} day(s) ago`}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => createDealFromLead(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
                          <Briefcase size={12} />
                          Deal
                        </button>
                        <button onClick={() => createFollowup(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100">
                          <CalendarClock size={12} />
                          Follow-up
                        </button>
                        <button onClick={() => logLeadInteraction(lead.id, 'call', 'Manual call logged')} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100">
                          <Phone size={12} />
                          Log Call
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => createTaskFromLead(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-50 text-slate-700 rounded-md hover:bg-slate-100">
                          <CheckSquare size={12} />
                          Task
                        </button>
                        <button onClick={() => createContactFromLead(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100">
                          <UserPlus size={12} />
                          Contact
                        </button>
                        <button onClick={() => openTimeline(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-violet-50 text-violet-700 rounded-md hover:bg-violet-100">
                          <Clock3 size={12} />
                          Timeline
                        </button>
                        <button onClick={() => openAssistant(lead)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
                          <Wand2 size={12} />
                          AI Assist
                        </button>
                        <button onClick={() => openModal(lead)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredLeads.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
            </p>
            <div className="flex gap-2 items-center">
              <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-900">
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
                  <p className="text-sm text-gray-500">Keep your pipeline up to date.</p>
                </div>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Lead name" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} placeholder="Company" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="Phone" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <select value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  {statuses.filter((status) => status !== 'All').map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <input type="number" min="0" value={form.value} onChange={(e) => setForm((current) => ({ ...current, value: e.target.value }))} placeholder="Potential value" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <select value={form.source} onChange={(e) => setForm((current) => ({ ...current, source: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  {['Manual', 'LinkedIn', 'Referral', 'Website', 'Event'].map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <select value={form.assignedTo} onChange={(e) => setForm((current) => ({ ...current, assignedTo: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Assign to team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingLead ? 'Save Lead' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {timelineLead && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Activity Timeline • {timelineLead.name}</h2>
                <button onClick={() => setTimelineLead(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3 max-h-[65vh]">
                {getLeadTimeline(timelineLead.id).map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <p className="font-semibold text-gray-900 text-sm">{event.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(event.timestamp).toLocaleString()} • {event.actor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {assistantLead && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-600" />
                  AI Sales Assistant • {assistantLead.name}
                </h2>
                <button onClick={() => { setAssistantLead(null); setAssistantData(null); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {assistantLoading && <p className="text-sm text-gray-600">Generating personalized suggestions...</p>}
                {!assistantLoading && assistantData && (
                  <>
                    <div className="p-3 rounded-lg bg-indigo-50">
                      <p className="text-xs text-indigo-700 font-semibold">OUTREACH MESSAGE</p>
                      <p className="text-sm text-gray-800 mt-1">{assistantData.outreachMessage}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-700 font-semibold">REPLY DRAFT</p>
                      <p className="text-sm text-gray-800 mt-1">{assistantData.replyDraft}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50">
                      <p className="text-xs text-emerald-700 font-semibold">PITCH STRATEGY</p>
                      <p className="text-sm text-gray-800 mt-1">{assistantData.pitchStrategy}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50">
                      <p className="text-xs text-amber-700 font-semibold">OBJECTION HANDLING</p>
                      <ul className="text-sm text-gray-800 mt-1 list-disc list-inside">
                        {assistantData.objectionHandling.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
