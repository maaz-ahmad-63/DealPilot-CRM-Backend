const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const connectDB = require('./utils/database');
const WebSocketManager = require('./websocket/socketManager');

// Middleware
const workspaceMiddleware = require('./middleware/workspace');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes (Phase 2 - SaaS with Workspace)
const campaignsRoutes = require('./routes/campaigns');
const contactsRoutes = require('./routes/contacts');
const templatesRoutes = require('./routes/templates');
const segmentsRoutes = require('./routes/segments');

// Routes (Phase 3 - AI Integration)
const aiRoutes = require('./routes/ai');
const smartCrmRoutes = require('./routes/smartCrm');
const authRoutes = require('./routes/auth');
const meetingsRoutes = require('./routes/meetings');
const socialMediaRoutes = require('./routes/socialMedia');

app.use('/api/auth', authRoutes);

app.use('/api/campaigns', workspaceMiddleware, campaignsRoutes);
app.use('/api/contacts', workspaceMiddleware, contactsRoutes);
app.use('/api/templates', workspaceMiddleware, templatesRoutes);
app.use('/api/segments', workspaceMiddleware, segmentsRoutes);

// Routes (Phase 3 - AI Integration)
app.use('/api/ai', workspaceMiddleware, aiRoutes);
app.use('/api/ai-crm', workspaceMiddleware, smartCrmRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'WhatsApp CRM Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      campaigns: '/api/campaigns',
      contacts: '/api/contacts',
      templates: '/api/templates',
      segments: '/api/segments',
      ai: '/api/ai',
      smartCrm: '/api/ai-crm',
      meetings: '/api/meetings',
      socialMedia: '/api/social-media'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChatFlow CRM API is running' });
});

// 404 Handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const wsManager = new WebSocketManager(server);

server.listen(PORT, () => {
  console.log(`WhatsApp CRM Backend running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});

module.exports = app;
