import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Campaigns APIs
export const campaignAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  send: (id) => api.post(`/campaigns/${id}/send`),
};

// Contacts APIs
export const contactAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Templates APIs
export const templateAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getOne: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Segments APIs
export const segmentAPI = {
  getAll: (params) => api.get('/segments', { params }),
  getOne: (id) => api.get(`/segments/${id}`),
  create: (data) => api.post('/segments', data),
  update: (id, data) => api.put(`/segments/${id}`, data),
  delete: (id) => api.delete(`/segments/${id}`),
};

// AI APIs
export const aiAPI = {
  generateTemplate: (prompt) => api.post('/ai/generate-template', { prompt }),
  optimizeSubject: (subject) => api.post('/ai/optimize-subject', { subject }),
  analyzeCampaign: (campaignId) => api.post(`/ai/analyze/${campaignId}`),
  suggestBestTime: (campaignId) => api.post(`/ai/best-time/${campaignId}`),
  scoreLeads: (contactIds) => api.post('/ai/score-leads', { contactIds }),
  personalizeContent: (content, contactData) =>
    api.post('/ai/personalize', { content, contactData }),
};

export const smartCrmAPI = {
  scoreLead: (lead) => api.post('/ai-crm/score-lead', { lead }),
  nextAction: (lead) => api.post('/ai-crm/next-action', { lead }),
  extractLead: (rawText) => api.post('/ai-crm/extract-lead', { rawText }),
  generateFollowup: (lead, channel = 'email') => api.post('/ai-crm/generate-followup', { lead, channel }),
  salesAssistant: (lead, notes = '') => api.post('/ai-crm/sales-assistant', { lead, notes }),
};

export default api;
