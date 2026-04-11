function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function daysSince(timestamp) {
  if (!timestamp) return 365;
  const diff = Date.now() - Number(timestamp);
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function computeLeadScore(lead = {}) {
  const engagementFrequency = Number(lead.engagementFrequency || 0);
  const dealValue = Number(lead.value || 0);
  const status = lead.status || 'New';

  const engagementScore = clamp(engagementFrequency * 6, 0, 30);
  const recencyScore = clamp(25 - daysSince(lead.lastInteractionAt) * 2, 0, 25);
  const valueScore = clamp(Math.round(Math.min(1, dealValue / 100000) * 25), 0, 25);

  const statusScoreMap = {
    New: 4,
    Contacted: 10,
    Qualified: 15,
    Converted: 20,
    Lost: 0,
  };

  const statusScore = statusScoreMap[status] || 0;
  const score = clamp(Math.round(engagementScore + recencyScore + valueScore + statusScore), 0, 100);

  return {
    score,
    breakdown: {
      engagementScore,
      recencyScore,
      valueScore,
      statusScore,
    },
  };
}

function nextBestAction(lead = {}) {
  const inactiveDays = daysSince(lead.lastInteractionAt);
  if (lead.status === 'Converted') return 'Create expansion opportunity';
  if (inactiveDays >= Number(lead.inactivityThreshold || 5)) return 'Send follow-up email';
  if (lead.status === 'New') return 'Schedule discovery call';
  if (lead.status === 'Contacted') return 'Share case study and book demo';
  if (lead.status === 'Qualified') return 'Send proposal and timeline';
  return 'Review lead details and update stage';
}

function extractLead(rawText = '') {
  const text = String(rawText || '').trim();
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d[\d\s()-]{7,}\d)/);
  const companyMatch = text.match(/(?:company|organization|at)\s*[:\-]?\s*([A-Za-z0-9 &.-]{2,})/i);
  const roleMatch = text.match(/(?:role|title|position)\s*[:\-]?\s*([A-Za-z0-9 &/-]{2,})/i);

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  let name = lines[0] || '';
  if (!name && emailMatch) {
    name = emailMatch[0].split('@')[0].replace(/[._-]/g, ' ');
  }

  return {
    name: name || 'Unknown Lead',
    company: companyMatch?.[1]?.trim() || 'Unknown Company',
    role: roleMatch?.[1]?.trim() || '',
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0] || '',
    source: /linkedin/i.test(text) ? 'LinkedIn' : /referral/i.test(text) ? 'Referral' : 'Manual',
  };
}

function generateFollowup(lead = {}, channel = 'email') {
  if (channel === 'text') {
    return `Hi ${lead.name || 'there'}, following up on your ${lead.company || 'team'} requirements. I can share a short rollout plan if helpful.`;
  }

  return `Subject: Quick follow-up on ${lead.company || 'your project'}\n\nHi ${lead.name || 'there'},\n\nJust following up on our previous conversation. Based on your goals, we can help automate follow-ups and improve conversions with a fast rollout.\n\nWould a short call this week work?\n\nBest regards,\nSales Team`;
}

function salesAssistant(lead = {}, notes = '') {
  const action = nextBestAction(lead);

  return {
    outreachMessage: `Hi ${lead.name || 'there'}, based on your priorities at ${lead.company || 'your company'}, I have a focused implementation plan to improve pipeline velocity.`,
    replyDraft: `Thanks for the update. Based on your latest note${notes ? ` (${notes.slice(0, 80)})` : ''}, I suggest we ${action.toLowerCase()}.`,
    pitchStrategy: 'Lead with measurable outcomes, show implementation speed, and reduce perceived risk with a phased rollout.',
    objectionHandling: [
      'Budget: start with one sales pod and expand after measurable wins.',
      'Timing: propose a 14-day pilot with pre-defined milestones.',
      'Complexity: provide integration checklist and owner mapping.',
    ],
    nextBestAction: action,
  };
}

module.exports = {
  computeLeadScore,
  nextBestAction,
  extractLead,
  generateFollowup,
  salesAssistant,
};
