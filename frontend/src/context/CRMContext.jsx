import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CRMContext = createContext();
const STORAGE_KEY = 'crm_workspace_v1';

const STAGE_ORDER = {
  New: 1,
  Contacted: 2,
  Qualified: 3,
  Converted: 4,
  Lost: 0,
};

const STATUS_SCORE = {
  New: 4,
  Contacted: 10,
  Qualified: 15,
  Converted: 20,
  Lost: 0,
};

const PERMISSIONS = {
  admin: ['assign_leads', 'manage_team', 'delete_any', 'view_all'],
  sales_rep: ['edit_assigned', 'create_followups', 'view_all'],
};

const defaultState = {
  teamMembers: [
    { id: 'member_1', name: 'Alex Morgan', email: 'alex@crmpro.com', role: 'admin' },
    { id: 'member_2', name: 'Priya Sharma', email: 'priya@crmpro.com', role: 'sales_rep' },
    { id: 'member_3', name: 'Sam Rivera', email: 'sam@crmpro.com', role: 'sales_rep' },
  ],
  currentMemberId: 'member_1',
  leads: [
    {
      id: 'lead_1',
      name: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 234 567 8900',
      status: 'New',
      company: 'Acme Corp',
      value: 50000,
      source: 'LinkedIn',
      engagementFrequency: 4,
      lastInteractionAt: Date.now() - 1000 * 60 * 60 * 28,
      statusUpdatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      assignedTo: 'member_2',
      notes: 'Interested in automation use-cases.',
      timeline: [
        {
          id: 'timeline_1',
          type: 'lead_created',
          channel: 'system',
          description: 'Lead created from LinkedIn outreach',
          timestamp: Date.now() - 1000 * 60 * 60 * 48,
          actorId: 'member_2',
        },
      ],
    },
    {
      id: 'lead_2',
      name: 'Sarah Johnson',
      email: 'sarah@techsol.com',
      phone: '+1 234 567 8901',
      status: 'Qualified',
      company: 'Tech Solutions',
      value: 75000,
      source: 'Referral',
      engagementFrequency: 8,
      lastInteractionAt: Date.now() - 1000 * 60 * 60 * 6,
      statusUpdatedAt: Date.now() - 1000 * 60 * 60 * 24,
      assignedTo: 'member_3',
      notes: 'Requested security + SLA details.',
      timeline: [
        {
          id: 'timeline_2',
          type: 'lead_created',
          channel: 'system',
          description: 'Lead created from customer referral',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 6,
          actorId: 'member_3',
        },
      ],
    },
    {
      id: 'lead_3',
      name: 'Michael Chen',
      email: 'michael@greentech.com',
      phone: '+1 234 567 8902',
      status: 'Contacted',
      company: 'GreenTech Industries',
      value: 60000,
      source: 'Website',
      engagementFrequency: 3,
      lastInteractionAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      statusUpdatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      assignedTo: 'member_2',
      notes: 'Waiting for budget approval.',
      timeline: [
        {
          id: 'timeline_3',
          type: 'call',
          channel: 'phone',
          description: 'Discovery call completed',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
          actorId: 'member_2',
        },
      ],
    },
    {
      id: 'lead_4',
      name: 'Emma Davis',
      email: 'emma@innovate.com',
      phone: '+1 234 567 8903',
      status: 'Qualified',
      company: 'Innovate Labs',
      value: 85000,
      source: 'Event',
      engagementFrequency: 6,
      lastInteractionAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      statusUpdatedAt: Date.now() - 1000 * 60 * 60 * 30,
      assignedTo: 'member_1',
      notes: 'Needs integration timeline and onboarding plan.',
      timeline: [
        {
          id: 'timeline_4',
          type: 'meeting',
          channel: 'meeting',
          description: 'Demo completed with buying committee',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
          actorId: 'member_1',
        },
      ],
    },
  ],
  deals: [
    { id: 'deal_1', leadId: 'lead_1', name: 'Enterprise Package - Acme', value: 85000, stage: 'Negotiation', owner: 'Alex Morgan', dueDate: '2026-04-20', probability: 75, stageUpdatedAt: Date.now() - 1000 * 60 * 60 * 24 * 8 },
    { id: 'deal_2', leadId: 'lead_2', name: 'Cloud Migration - Tech Sol', value: 125000, stage: 'Proposal', owner: 'Priya Sharma', dueDate: '2026-04-25', probability: 60, stageUpdatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
    { id: 'deal_3', leadId: 'lead_3', name: 'Support Contract - GreenTech', value: 45000, stage: 'Closed Won', owner: 'Sam Rivera', dueDate: '2026-04-12', probability: 100, stageUpdatedAt: Date.now() - 1000 * 60 * 60 * 18 },
  ],
  tasks: [
    { id: 'task_1', leadId: 'lead_1', title: 'Follow up call with Acme Corp', status: 'pending', dueDate: '2026-04-10', assignee: 'Alex Morgan', priority: 'high', autoCreated: true },
    { id: 'task_2', leadId: 'lead_2', title: 'Send proposal to Tech Solutions', status: 'completed', dueDate: '2026-04-08', assignee: 'Priya Sharma', priority: 'high', autoCreated: false },
    { id: 'task_3', leadId: 'lead_3', title: 'Review contract - GreenTech', status: 'pending', dueDate: '2026-04-12', assignee: 'Sam Rivera', priority: 'medium', autoCreated: false },
  ],
  followUps: [],
  contacts: [
    { id: 'contact_1', name: 'John Smith', email: 'john@acme.com', phone: '+1 234 567 8900', company: 'Acme Corp', city: 'New York' },
    { id: 'contact_2', name: 'Sarah Johnson', email: 'sarah@techsol.com', phone: '+1 234 567 8901', company: 'Tech Solutions', city: 'San Francisco' },
    { id: 'contact_3', name: 'Michael Chen', email: 'michael@greentech.com', phone: '+1 234 567 8902', company: 'GreenTech Industries', city: 'Boston' },
  ],
  preferences: {
    notifications: true,
    emailDigest: 'weekly',
    twoFactor: false,
    theme: 'light',
    inactivityDays: 5,
    autoTaskCreation: true,
  },
  activity: [
    { id: 'activity_1', type: 'New Lead', description: 'John Smith from Acme Corp', timestamp: Date.now() - 1000 * 60 * 60 * 2, status: 'new', actorId: 'member_2' },
    { id: 'activity_2', type: 'Deal Won', description: '$45,000 deal closed with GreenTech', timestamp: Date.now() - 1000 * 60 * 60 * 5, status: 'success', actorId: 'member_3' },
    { id: 'activity_3', type: 'Task Due', description: 'Review contract - GreenTech', timestamp: Date.now() - 1000 * 60 * 60 * 20, status: 'warning', actorId: 'member_1' },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (error) {
    return defaultState;
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysSince(timestamp) {
  const diff = Date.now() - Number(timestamp || 0);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / (1000 * 60)));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function CRMProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getMemberById = (memberId) => state.teamMembers.find((member) => member.id === memberId);

  const logActivity = (type, description, status = 'info', actorId = state.currentMemberId, leadId = null) => {
    setState((current) => ({
      ...current,
      activity: [
        {
          id: createId('activity'),
          type,
          description,
          timestamp: Date.now(),
          status,
          actorId,
          leadId,
        },
        ...current.activity,
      ].slice(0, 12),
    }));
  };

  const updateCollection = (key, updater) => {
    setState((current) => ({
      ...current,
      [key]: updater(current[key]),
    }));
  };

  const can = (permission, memberId = state.currentMemberId) => {
    const member = getMemberById(memberId);
    if (!member) return false;
    return (PERMISSIONS[member.role] || []).includes(permission);
  };

  const addTimelineEvent = (timeline, payload) => [
    {
      id: createId('timeline'),
      timestamp: Date.now(),
      actorId: state.currentMemberId,
      channel: 'system',
      ...payload,
    },
    ...(timeline || []),
  ];

  const generateFollowupMessage = (lead, channel = 'email') => {
    if (channel === 'text') {
      return `Hi ${lead.name}, just checking in on your ${lead.company} evaluation. Happy to share a quick plan and pricing options this week.`;
    }
    return `Subject: Quick follow-up on ${lead.company} CRM initiative\n\nHi ${lead.name},\n\nI wanted to follow up on your CRM priorities. Based on your goals, we can reduce manual follow-ups and improve conversion with an automated workflow in under 2 weeks.\n\nWould you be open to a 20-minute call this week?\n\nBest regards,\n${getMemberById(state.currentMemberId)?.name || 'CRM Team'}`;
  };

  const getNextBestAction = (lead) => {
    const daysInactive = getDaysSince(lead.lastInteractionAt);
    if (lead.status === 'Converted') return 'Create expansion opportunity';
    if (daysInactive >= (state.preferences.inactivityDays || 5)) return 'Send follow-up email';
    if (lead.status === 'New') return 'Schedule discovery call';
    if (lead.status === 'Contacted') return 'Share case study + book demo';
    if (lead.status === 'Qualified') return 'Send proposal and timeline';
    return 'Review account and update stage';
  };

  const createAutoTask = (currentTasks, payload) => {
    const exists = currentTasks.some((task) => task.title === payload.title && task.leadId === payload.leadId && task.status === 'pending');
    if (exists) {
      return currentTasks;
    }
    return [
      {
        id: createId('task'),
        status: 'pending',
        autoCreated: true,
        ...payload,
      },
      ...currentTasks,
    ];
  };

  const addLead = (lead) => {
    const now = Date.now();
    const assignedTo = lead.assignedTo || state.currentMemberId;
    const nextLead = {
      ...lead,
      id: createId('lead'),
      source: lead.source || 'Manual',
      engagementFrequency: Number(lead.engagementFrequency || 1),
      lastInteractionAt: now,
      statusUpdatedAt: now,
      assignedTo,
      timeline: [
        {
          id: createId('timeline'),
          type: 'lead_created',
          channel: 'system',
          description: `Lead created and assigned to ${getMemberById(assignedTo)?.name || 'team'}`,
          timestamp: now,
          actorId: state.currentMemberId,
        },
      ],
    };

    setState((current) => {
      const nextTasks = current.preferences.autoTaskCreation
        ? createAutoTask(current.tasks, {
            leadId: nextLead.id,
            title: `Initial qualification call with ${nextLead.name}`,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
            assignee: getMemberById(assignedTo)?.name || nextLead.name,
            priority: 'medium',
          })
        : current.tasks;

      return {
        ...current,
        leads: [nextLead, ...current.leads],
        tasks: nextTasks,
      };
    });

    logActivity('Lead Added', `${nextLead.name} from ${nextLead.company}`, 'new', state.currentMemberId, nextLead.id);
  };

  const updateLead = (id, updates) => {
    const oldLead = state.leads.find((item) => item.id === id);
    setState((current) => {
      let nextTasks = [...current.tasks];
      const nextLeads = current.leads.map((item) => {
        if (item.id !== id) return item;
        const statusChanged = updates.status && updates.status !== item.status;
        const timeline = statusChanged
          ? addTimelineEvent(item.timeline, {
              type: 'status_change',
              description: `Stage changed from ${item.status} to ${updates.status}`,
            })
          : item.timeline;

        if (statusChanged && current.preferences.autoTaskCreation) {
          if (updates.status === 'Contacted') {
            nextTasks = createAutoTask(nextTasks, {
              leadId: item.id,
              title: `Send discovery summary to ${item.name}`,
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
              assignee: getMemberById(item.assignedTo)?.name || item.name,
              priority: 'high',
            });
          }
          if (updates.status === 'Qualified') {
            nextTasks = createAutoTask(nextTasks, {
              leadId: item.id,
              title: `Schedule product demo for ${item.company}`,
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
              assignee: getMemberById(item.assignedTo)?.name || item.name,
              priority: 'high',
            });
          }
        }

        return {
          ...item,
          ...updates,
          engagementFrequency: Number(item.engagementFrequency || 0) + 1,
          lastInteractionAt: Date.now(),
          statusUpdatedAt: statusChanged ? Date.now() : item.statusUpdatedAt,
          timeline,
        };
      });

      return {
        ...current,
        leads: nextLeads,
        tasks: nextTasks,
      };
    });

    if (updates.status && oldLead && updates.status === 'Converted') {
      logActivity('Lead Converted', `${oldLead.name} moved to Converted`, 'success', state.currentMemberId, id);
    } else {
      logActivity('Lead Updated', `${updates.name || oldLead?.name || 'Lead'} was updated`, 'info', state.currentMemberId, id);
    }
  };

  const deleteLead = (id) => {
    const lead = state.leads.find((item) => item.id === id);
    updateCollection('leads', (items) => items.filter((item) => item.id !== id));
    if (lead) logActivity('Lead Deleted', `${lead.name} was removed`, 'warning', state.currentMemberId, id);
  };

  const assignLead = (leadId, memberId) => {
    if (!can('assign_leads')) {
      return false;
    }
    updateLead(leadId, { assignedTo: memberId });
    const member = getMemberById(memberId);
    logActivity('Lead Assigned', `Lead assigned to ${member?.name || 'team member'}`, 'info', state.currentMemberId, leadId);
    return true;
  };

  const logLeadInteraction = (leadId, interactionType, note = '') => {
    setState((current) => ({
      ...current,
      leads: current.leads.map((lead) => {
        if (lead.id !== leadId) return lead;
        return {
          ...lead,
          engagementFrequency: Number(lead.engagementFrequency || 0) + 1,
          lastInteractionAt: Date.now(),
          timeline: addTimelineEvent(lead.timeline, {
            type: interactionType,
            channel: interactionType,
            description: note || `Interaction logged via ${interactionType}`,
          }),
        };
      }),
    }));
    logActivity('Interaction Logged', `${interactionType} logged`, 'info', state.currentMemberId, leadId);
  };

  const scheduleFollowup = (leadId, options = {}) => {
    const lead = state.leads.find((item) => item.id === leadId);
    if (!lead) return null;
    const scheduledFor = options.scheduledFor || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);
    const channel = options.channel || 'email';
    const message = options.message || generateFollowupMessage(lead, channel);

    const followup = {
      id: createId('followup'),
      leadId,
      channel,
      message,
      scheduledFor,
      status: 'scheduled',
      createdAt: Date.now(),
      assigneeId: options.assigneeId || lead.assignedTo || state.currentMemberId,
    };

    setState((current) => ({
      ...current,
      followUps: [followup, ...current.followUps],
      tasks: createAutoTask(current.tasks, {
        leadId,
        title: `Follow-up (${channel}) for ${lead.name}`,
        dueDate: scheduledFor,
        assignee: getMemberById(followup.assigneeId)?.name || lead.name,
        priority: 'high',
      }),
      leads: current.leads.map((item) =>
        item.id === leadId
          ? {
              ...item,
              timeline: addTimelineEvent(item.timeline, {
                type: 'followup_scheduled',
                channel,
                description: `Follow-up scheduled for ${scheduledFor}`,
              }),
            }
          : item
      ),
    }));

    logActivity('Follow-up Scheduled', `Follow-up set for ${lead.name}`, 'info', state.currentMemberId, leadId);
    return followup;
  };

  const markFollowupDone = (followupId) => {
    const followup = state.followUps.find((item) => item.id === followupId);
    if (!followup) return;
    setState((current) => ({
      ...current,
      followUps: current.followUps.map((item) =>
        item.id === followupId
          ? {
              ...item,
              status: 'completed',
              completedAt: Date.now(),
            }
          : item
      ),
    }));
    logLeadInteraction(followup.leadId, followup.channel, 'Follow-up completed');
  };

  const addDeal = (deal) => {
    const nextDeal = { ...deal, id: createId('deal'), stageUpdatedAt: Date.now() };
    updateCollection('deals', (items) => [nextDeal, ...items]);
    logActivity('Deal Added', `${nextDeal.name} created`, 'info');
  };

  const updateDeal = (id, updates) => {
    updateCollection('deals', (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              stageUpdatedAt: updates.stage && updates.stage !== item.stage ? Date.now() : item.stageUpdatedAt,
            }
          : item
      )
    );
    logActivity('Deal Updated', `${updates.name || 'Deal'} was updated`, 'info');
  };

  const deleteDeal = (id) => {
    const deal = state.deals.find((item) => item.id === id);
    updateCollection('deals', (items) => items.filter((item) => item.id !== id));
    if (deal) logActivity('Deal Deleted', `${deal.name} was removed`, 'warning');
  };

  const addTask = (task) => {
    const nextTask = { ...task, id: createId('task') };
    updateCollection('tasks', (items) => [nextTask, ...items]);
    logActivity('Task Added', nextTask.title, 'info');
  };

  const updateTask = (id, updates) => {
    updateCollection('tasks', (items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    if (updates.status === 'completed') {
      logActivity('Task Completed', state.tasks.find((task) => task.id === id)?.title || 'Task completed', 'success');
    }
  };

  const deleteTask = (id) => {
    const task = state.tasks.find((item) => item.id === id);
    updateCollection('tasks', (items) => items.filter((item) => item.id !== id));
    if (task) logActivity('Task Deleted', task.title, 'warning');
  };

  const addContact = (contact) => {
    const nextContact = { ...contact, id: createId('contact') };
    updateCollection('contacts', (items) => [nextContact, ...items]);
    logActivity('Contact Added', `${nextContact.name} added to contacts`, 'info');
  };

  const updateContact = (id, updates) => {
    updateCollection('contacts', (items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    logActivity('Contact Updated', `${updates.name || 'Contact'} was updated`, 'info');
  };

  const deleteContact = (id) => {
    const contact = state.contacts.find((item) => item.id === id);
    updateCollection('contacts', (items) => items.filter((item) => item.id !== id));
    if (contact) logActivity('Contact Deleted', `${contact.name} was removed`, 'warning');
  };

  const updatePreferences = (updates) => {
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...updates,
      },
    }));
  };

  const setCurrentMember = (memberId) => {
    setState((current) => ({
      ...current,
      currentMemberId: memberId,
    }));
  };

  const extractLeadData = (rawInput) => {
    const text = String(rawInput || '').trim();
    if (!text) return null;

    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = text.match(/(\+?\d[\d\s()-]{7,}\d)/);
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

    let name = '';
    let company = '';
    let role = '';

    if (lines.length > 0) {
      name = lines[0].replace(/^name\s*[:\-]\s*/i, '').trim();
    }

    const companyMatch = text.match(/(?:company|at|organization)\s*[:\-]?\s*([A-Za-z0-9 &.-]{2,})/i);
    if (companyMatch) {
      company = companyMatch[1].trim();
    }

    const roleMatch = text.match(/(?:role|title|position)\s*[:\-]?\s*([A-Za-z0-9 &/-]{2,})/i);
    if (roleMatch) {
      role = roleMatch[1].trim();
    }

    if (!name && emailMatch) {
      name = emailMatch[0].split('@')[0].replace(/[._-]/g, ' ');
    }

    return {
      name: name || 'Unknown Lead',
      company: company || 'Unknown Company',
      role,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      source: /linkedin/i.test(text) ? 'LinkedIn' : /referral/i.test(text) ? 'Referral' : 'Manual',
      status: 'New',
      value: 0,
      engagementFrequency: 1,
      notes: text.slice(0, 300),
    };
  };

  const createLeadFromRawInput = (rawInput) => {
    const parsed = extractLeadData(rawInput);
    if (!parsed) return null;
    addLead(parsed);
    return parsed;
  };

  const generateSalesAssistantContent = async (leadId, interactionNotes = '') => {
    const lead = state.leads.find((item) => item.id === leadId);
    if (!lead) {
      return null;
    }
    const nextStep = getNextBestAction(lead);
    const tone = lead.status === 'Qualified' ? 'consultative' : 'friendly';

    return {
      outreachMessage: `Hi ${lead.name}, based on your focus at ${lead.company}, I put together a concise plan to improve lead response speed and pipeline visibility. Can we review this in a 20-minute call?`,
      replyDraft: `Thanks ${lead.name}, appreciate the update. Based on your note${interactionNotes ? ` (${interactionNotes.slice(0, 80)})` : ''}, I recommend we prioritize ${nextStep.toLowerCase()} so your team can move faster this week.`,
      pitchStrategy: `Use a ${tone} pitch focused on ROI, automation speed, and team adoption. Lead with one measurable metric, then show an implementation timeline.`,
      objectionHandling: [
        'Budget objection: position phased rollout with immediate wins in follow-up automation.',
        'Timing objection: propose a pilot for one sales pod in under 14 days.',
        'Integration objection: share migration plan with low-risk milestone checkpoints.',
      ],
      nextStep,
    };
  };

  const getLeadTimeline = (leadId) => {
    const lead = state.leads.find((item) => item.id === leadId);
    if (!lead) return [];
    return [...(lead.timeline || [])]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((event) => ({
        ...event,
        actor: getMemberById(event.actorId)?.name || 'System',
      }));
  };

  const dashboardStats = useMemo(() => {
    const totalLeadValue = state.leads.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
    const activeDeals = state.deals.filter((deal) => deal.stage !== 'Closed Lost').length;
    const openTasks = state.tasks.filter((task) => task.status !== 'completed').length;

    return [
      { label: 'Total Leads', value: state.leads.length.toString(), change: `${state.leads.filter((lead) => lead.status === 'Qualified').length} qualified`, color: 'blue' },
      { label: 'Active Deals', value: activeDeals.toString(), change: `${state.deals.filter((deal) => deal.stage === 'Closed Won').length} won`, color: 'green' },
      { label: 'Pipeline Value', value: `$${totalLeadValue.toLocaleString()}`, change: `${state.deals.length} open deals`, color: 'purple' },
      { label: 'Tasks Pending', value: openTasks.toString(), change: `${state.tasks.filter((task) => task.priority === 'high' && task.status !== 'completed').length} high priority`, color: 'orange' },
    ];
  }, [state.deals, state.leads, state.tasks]);

  const leadIntelligence = useMemo(() => {
    const maxValue = Math.max(...state.leads.map((lead) => Number(lead.value || 0)), 1);

    return state.leads.map((lead) => {
      const engagementScore = clamp(Number(lead.engagementFrequency || 0) * 6, 0, 30);
      const inactivityDays = getDaysSince(lead.lastInteractionAt);
      const recencyScore = clamp(25 - inactivityDays * 2, 0, 25);
      const valueScore = clamp(Math.round((Number(lead.value || 0) / maxValue) * 25), 0, 25);
      const stageScore = STATUS_SCORE[lead.status] || 0;
      const stageProgression = STAGE_ORDER[lead.status] || 0;
      const total = clamp(Math.round(engagementScore + recencyScore + valueScore + stageScore), 0, 100);

      const scoreBreakdown = {
        engagementScore,
        recencyScore,
        valueScore,
        stageScore,
        stageProgression,
      };

      return {
        ...lead,
        leadScore: total,
        scoreBreakdown,
        inactivityDays,
        isInactive: inactivityDays >= (state.preferences.inactivityDays || 5),
        nextBestAction: getNextBestAction(lead),
      };
    });
  }, [state.leads, state.preferences.inactivityDays]);

  const hotLeads = useMemo(
    () => leadIntelligence.filter((lead) => lead.leadScore >= 75 && lead.status !== 'Converted').sort((a, b) => b.leadScore - a.leadScore),
    [leadIntelligence]
  );

  const inactiveLeads = useMemo(
    () => leadIntelligence.filter((lead) => lead.isInactive && !['Converted', 'Lost'].includes(lead.status)),
    [leadIntelligence]
  );

  const followupReminders = useMemo(
    () =>
      inactiveLeads.map((lead) => ({
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        inactivityDays: lead.inactivityDays,
        priority: lead.leadScore >= 70 ? 'high' : 'medium',
        suggestedMessage: generateFollowupMessage(lead),
      })),
    [inactiveLeads]
  );

  const enrichedTasks = useMemo(() => {
    const today = startOfDay(new Date()).getTime();
    return state.tasks.map((task) => {
      const due = startOfDay(task.dueDate).getTime();
      return {
        ...task,
        isOverdue: task.status !== 'completed' && due < today,
      };
    });
  }, [state.tasks]);

  const smartInsights = useMemo(() => {
    const insights = [];

    const stuckNegotiation = state.deals.filter(
      (deal) => deal.stage === 'Negotiation' && getDaysSince(deal.stageUpdatedAt) > 5
    );
    if (stuckNegotiation.length > 0) {
      insights.push({
        id: 'insight_stuck_negotiation',
        severity: 'warning',
        title: `${stuckNegotiation.length} deal(s) stuck in negotiation > 5 days`,
        action: 'Trigger executive follow-up and unblock decision makers.',
      });
    }

    const now = Date.now();
    const sevenDays = 1000 * 60 * 60 * 24 * 7;
    const currentWeekConverted = state.activity.filter(
      (item) => item.type === 'Lead Converted' && item.timestamp >= now - sevenDays
    ).length;
    const previousWeekConverted = state.activity.filter(
      (item) => item.type === 'Lead Converted' && item.timestamp < now - sevenDays && item.timestamp >= now - sevenDays * 2
    ).length;

    if (currentWeekConverted < previousWeekConverted) {
      insights.push({
        id: 'insight_conversion_drop',
        severity: 'critical',
        title: 'Conversion rate dropped compared to last week',
        action: 'Review follow-up SLA and fast-track high score leads.',
      });
    }

    const sourceBuckets = state.leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    const [topSource, topSourceCount] = Object.entries(sourceBuckets).sort((a, b) => b[1] - a[1])[0] || [];
    if (topSource) {
      insights.push({
        id: 'insight_top_source',
        severity: 'info',
        title: `Top performing lead source: ${topSource}`,
        action: `${topSourceCount} active lead(s) from this source. Increase acquisition spend here.`,
      });
    }

    const overdueCount = enrichedTasks.filter((task) => task.isOverdue).length;
    if (overdueCount > 0) {
      insights.push({
        id: 'insight_overdue_tasks',
        severity: 'warning',
        title: `${overdueCount} overdue task(s) detected`,
        action: 'Reassign overdue tasks and notify owners.',
      });
    }

    return insights;
  }, [enrichedTasks, state.activity, state.deals, state.leads]);

  const dashboardChartData = useMemo(() => {
    const statusBuckets = ['New', 'Contacted', 'Qualified', 'Converted'];
    return statusBuckets.map((status, index) => ({
      month: status,
      leads: state.leads.filter((lead) => lead.status === status).length,
      revenue: state.leads
        .filter((lead) => lead.status === status)
        .reduce((sum, lead) => sum + Number(lead.value || 0), 0) / 1000 + index * 10,
    }));
  }, [state.leads]);

  const dealStageData = useMemo(() => {
    const colors = {
      Qualification: '#60a5fa',
      Proposal: '#3b82f6',
      Negotiation: '#1e40af',
      'Closed Won': '#16a34a',
      'Closed Lost': '#94a3b8',
    };
    return Object.entries(
      state.deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({
      name,
      value: count,
      fill: colors[name] || '#94a3b8',
    }));
  }, [state.deals]);

  const recentActivity = useMemo(
    () =>
      state.activity.slice(0, 6).map((item) => ({
        ...item,
        time: formatRelativeTime(item.timestamp),
        actor: getMemberById(item.actorId)?.name || 'System',
      })),
    [state.activity, state.teamMembers]
  );

  const value = {
    ...state,
    currentMember: getMemberById(state.currentMemberId),
    can,
    dashboardStats,
    dashboardChartData,
    dealStageData,
    recentActivity,
    leadIntelligence,
    hotLeads,
    inactiveLeads,
    followupReminders,
    smartInsights,
    enrichedTasks,
    addLead,
    updateLead,
    deleteLead,
    assignLead,
    logLeadInteraction,
    scheduleFollowup,
    markFollowupDone,
    addDeal,
    updateDeal,
    deleteDeal,
    addTask,
    updateTask,
    deleteTask,
    addContact,
    updateContact,
    deleteContact,
    updatePreferences,
    setCurrentMember,
    extractLeadData,
    createLeadFromRawInput,
    generateSalesAssistantContent,
    getLeadTimeline,
    getNextBestAction,
    generateFollowupMessage,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within CRMProvider');
  }
  return context;
}
