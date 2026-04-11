# 🚀 Hybrid Deployment Guide - DealPilot CRM

## Architecture Overview

```
┌─────────────────────┐
│    Vercel (CDN)     │
│   Frontend (React)  │
└──────────┬──────────┘
           │
           │ API Calls
           ▼
┌─────────────────────┐
│  Render / Docker    │
│   Backend (Node)    │
│                     │
│  ├─ MongoDB         │
│  ├─ Redis           │
│  └─ Node Express    │
└─────────────────────┘
```

## 📋 Prerequisites

### For Local Docker Development:
- Docker Desktop (Mac/Windows) or Docker Engine (Linux)
- Docker Compose >= 3.8
- Git
- Node.js 18+ (for frontend local development)

### For Production Deployment:
- **Frontend**: Vercel account (free tier available)
- **Backend**: Render.com account (free tier or paid)
- **Database**: MongoDB Atlas (cloud) or managed MongoDB service
- **Cache**: Redis Cloud or similar service

---

## Part 1: Local Docker Development

### Step 1: Prepare Environment Variables

```bash
cd /Users/maazahmad/Documents/FlutterDev/crm_watsapp_bot

# Copy and customize the Docker environment file
cp .env.docker .env
```

Edit `.env` with your actual credentials:
```env
MONGO_USER=dealpilot_admin
MONGO_PASSWORD=your_secure_password
MONGO_DB=dealpilot
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_32_char_secret_key_here
FRONTEND_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GEMINI_API_KEY=your_gemini_key
```

### Step 2: Build Docker Images

```bash
# Build the backend Docker image
docker build -t dealpilot-backend:latest ./backend

# Or use docker-compose to build all services
docker-compose build
```

### Step 3: Start Services with Docker Compose

```bash
# Start all services (MongoDB, Redis, Backend)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f redis

# Stop all services
docker-compose down

# Stop and remove volumes (reset everything)
docker-compose down -v
```

### Step 4: Verify Backend is Running

```bash
# Check if backend is accessible
curl http://localhost:5001/health

# Expected response: 200 OK with health status
```

### Step 5: Run Frontend (Development Mode)

```bash
cd frontend

# Install dependencies
npm install

# Update .env for local development
# VITE_API_URL=http://localhost:5001

# Start Vite dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Part 2: Production Deployment - Render (Backend)

### Step 1: Prepare Repository

```bash
# Ensure everything is committed to git
git add .
git commit -m "Deploy: Add Docker and production configuration"
git push origin main
```

### Step 2: Deploy to Render.com

1. **Sign up at** [https://render.com](https://render.com)

2. **Create New Web Service**:
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub repository
   - Select the branch (main)

3. **Configure Build Settings**:
   - **Name**: dealpilot-backend
   - **Environment**: Docker
   - **Build Command**: (Leave default)
   - **Start Command**: `node src/server.js`
   - **Instance Type**: Starter (Free) or higher
   - **Region**: Choose closest to users

4. **Add Environment Variables** in Render dashboard:
   ```
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dealpilot
   REDIS_URL=redis://:password@redis-host.com:6379
   JWT_SECRET=your_32_char_secret_here
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_WEBHOOK_SECRET=your_secret
   GEMINI_API_KEY=your_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM=noreply@dealpilot.com
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your backend URL will be: `https://dealpilot-backend.onrender.com`

### Step 3: Configure Database & Cache

**MongoDB Atlas** (Cloud Database):
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Create database user
4. Get connection string
5. Add to Render environment: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dealpilot`

**Redis Cloud** (Cache Service):
1. Go to [https://redis.com/try-free/](https://redis.com/try-free/)
2. Create Redis database
3. Get connection URL
4. Add to Render environment: `REDIS_URL=redis://:password@host:port`

---

## Part 3: Production Deployment - Vercel (Frontend)

### Step 1: Prepare Frontend

```bash
cd frontend

# Create .env.production file
cat > .env.production << 'EOF'
VITE_API_URL=https://dealpilot-backend.onrender.com
VITE_API_TIMEOUT=30000
EOF

# Build locally to verify
npm run build
```

### Step 2: Deploy to Vercel

1. **Sign up at** [https://vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the repository

3. **Configure Build**:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   - Add `VITE_API_URL=https://dealpilot-backend.onrender.com`

5. **Root Directory**: Set to `frontend` (if monorepo)

6. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your frontend URL will be: `https://dealpilot.vercel.app`

### Step 3: Update Backend FRONTEND_URL

In Render dashboard, update:
```
FRONTEND_URL=https://dealpilot.vercel.app
```

---

## Part 4: Docker Build & Push (Optional - For Custom Registry)

### Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag your image
docker tag dealpilot-backend:latest yourusername/dealpilot-backend:latest

# Push to registry
docker push yourusername/dealpilot-backend:latest

# Other registries:
# AWS ECR: docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/dealpilot-backend:latest
# Google Container Registry: docker push gcr.io/your-project/dealpilot-backend:latest
```

### Deploy from Registry

Update your docker-compose.yml or Render:
```yaml
image: yourusername/dealpilot-backend:latest
```

---

## Part 5: GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }} \
            -H "Content-Type: application/json" \
            -d '{"clear_cache": false}'
```

Add `RENDER_DEPLOY_HOOK` in GitHub Secrets.

---

## Part 6: Domain Configuration

### Connect Custom Domain to Vercel (Frontend)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., app.example.com)
3. Add DNS records:
   ```
   CNAME app.example.com cname.vercel.com
   ```

### Connect Custom Domain to Render (Backend)

1. In Render Dashboard → Web Service → Settings
2. Add custom domain (e.g., api.example.com)
3. Add DNS CNAME record

---

## Part 7: Monitoring & Logging

### Docker Local Monitoring

```bash
# View resource usage
docker stats

# View logs with timestamps
docker-compose logs -f --timestamps backend

# Filter logs
docker-compose logs backend | grep error
```

### Production Monitoring

**Render Dashboard**:
- View logs in real-time
- Monitor resource usage
- Set up alerts

**Vercel Dashboard**:
- Monitor build and runtime
- View analytics
- Check deployment history

### Health Checks

```bash
# Backend health check
curl https://dealpilot-backend.onrender.com/health

# Database connection check
curl https://dealpilot-backend.onrender.com/api/health/db
```

---

## Part 8: Troubleshooting

### Backend not connecting to MongoDB

```bash
# Check MongoDB connection string
docker-compose logs mongodb

# Verify credentials
mongodb://user:password@host:port/database

# Test connection
docker-compose exec backend node -e "
  require('mongoose').connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected!'))
    .catch(e => console.error('Failed:', e))
"
```

### Docker build failing

```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Check Dockerfile
docker build --progress=plain -t dealpilot-backend:latest ./backend

# View build logs
docker buildx build --progress=plain -t dealpilot-backend:latest ./backend
```

### Port already in use

```bash
# Find process using port 5001
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use different port in docker-compose
- "5002:5001"
```

### Environment variables not loaded

```bash
# Verify .env file exists
ls -la .env

# Check if values are set
docker-compose config | grep JWT_SECRET

# View running container environment
docker exec dealpilot-backend env
```

---

## Part 9: Scaling Strategies

### Horizontal Scaling (Render)

1. Increase instance type
2. Enable auto-scaling if available
3. Use load balancer for multiple instances

### Database Optimization

```javascript
// Ensure indexes are created
db.meetings.createIndex({ date: 1, status: 1 })
db.socialmediaposts.createIndex({ scheduledTime: 1, status: 1 })
```

### Caching Strategy

- Use Redis for session data
- Cache frequently accessed data
- Set TTL for cache entries

---

## Part 10: Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters, random)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set CORS properly for your domain
- [ ] Use secure headers middleware
- [ ] Implement rate limiting
- [ ] Enable database encryption
- [ ] Regular backups enabled
- [ ] Monitor logs for suspicious activity

---

## Quick Reference Commands

```bash
# Local development
docker-compose up -d
cd frontend && npm run dev

# Build for production
docker build -t dealpilot-backend:latest ./backend
docker push yourusername/dealpilot-backend:latest

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down -v

# Rebuild from scratch
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

---

## Support & Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Render Deploy**: https://render.com/docs
- **Vercel Deploy**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
- **Redis Cloud**: https://redis.com/try-free/

---

## Next Steps

1. ✅ Create Docker setup (DONE)
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Configure MongoDB Atlas
5. Set up Redis Cloud
6. Connect custom domains
7. Set up monitoring and alerts
8. Configure CI/CD pipeline
9. Test end-to-end flow
10. Monitor performance and optimize

---

**Last Updated**: April 11, 2026
**Version**: 1.0.0
**Status**: Production Ready
