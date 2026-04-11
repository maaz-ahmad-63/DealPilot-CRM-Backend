# 🐳 Docker Setup & Deployment Guide

## Quick Start - Local Development

### Option 1: Automated Setup (Recommended)

```bash
# Make script executable (first time only)
chmod +x docker-setup.sh

# Run the setup script
./docker-setup.sh
```

The script will:
- ✅ Check Docker installation
- ✅ Create .env file
- ✅ Build Docker images
- ✅ Start all services
- ✅ Verify backend health

### Option 2: Manual Setup

```bash
# Copy environment file
cp .env.docker .env

# Build images
docker-compose build

# Start services
docker-compose up -d

# Wait ~10 seconds for services to start

# Verify backend is running
curl http://localhost:5001/health
```

---

## Services

### 📦 What Gets Started

| Service | Port | Container | Purpose |
|---------|------|-----------|---------|
| MongoDB | 27017 | dealpilot-mongodb | Database |
| Redis | 6379 | dealpilot-redis | Cache |
| Backend | 5001 | dealpilot-backend | API Server |

### 🔐 Default Credentials (from .env.docker)

```
MongoDB User: dealpilot_admin
MongoDB Password: secure_db_password_change_this
Redis Password: secure_redis_password_change_this
```

**⚠️ IMPORTANT**: Change these in `.env` before production use!

---

## Daily Commands

### Start Services
```bash
docker-compose up -d

# See logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### Stop Services
```bash
# Stop (data persists)
docker-compose down

# Stop and remove volumes (reset everything)
docker-compose down -v
```

### View Logs
```bash
# Backend logs
docker-compose logs -f backend

# MongoDB logs
docker-compose logs -f mongodb

# Redis logs
docker-compose logs -f redis

# Last 50 lines
docker-compose logs --tail=50 backend

# Grep for errors
docker-compose logs backend | grep error
```

### Database Management
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password

# Connect to Redis
docker-compose exec redis redis-cli

# View volumes
docker volume ls

# Inspect volume
docker volume inspect dealpilot-mongodb
```

---

## Frontend Development

While Docker is running:

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start frontend dev server
cd frontend
npm install
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5001
# MongoDB: http://localhost:27017
# Redis: http://localhost:6379
```

---

## Environment Variables

### Backend Configuration

Edit `.env` file to customize:

```env
# Server
PORT=5001
NODE_ENV=production

# Database
MONGO_USER=dealpilot_admin
MONGO_PASSWORD=secure_db_password_change_this
MONGO_DB=dealpilot

# Cache
REDIS_PASSWORD=secure_redis_password_change_this

# JWT
JWT_SECRET=your_32_char_secret_key_here
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# AI
GEMINI_API_KEY=your_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## Docker Compose File Explained

```yaml
version: '3.8'  # Docker Compose API version

services:
  # Service 1: MongoDB
  mongodb:
    image: mongo:7.0  # Official MongoDB image
    ports:
      - "27017:27017"  # Map container port to host
    environment:
      # Container environment variables
      MONGO_INITDB_ROOT_USERNAME: admin
    volumes:
      - mongodb_data:/data/db  # Persistent storage
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      # Check every 10s, allow 5s, retry 5 times

  # Service 2: Redis
  redis:
    image: redis:7-alpine  # Official Redis image
    ports:
      - "6379:6379"

  # Service 3: Backend
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile  # Build from Dockerfile
    ports:
      - "5001:5001"
    depends_on:
      mongodb:
        condition: service_healthy  # Wait for MongoDB to be healthy
      redis:
        condition: service_healthy  # Wait for Redis to be healthy

volumes:
  mongodb_data:
    driver: local  # Store on local disk

networks:
  dealpilot-network:
    driver: bridge  # Connect services together
```

---

## Dockerfile Explained

```dockerfile
# Multi-stage build (reduces final image size)

# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production  # Install only production dependencies

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules  # Copy from builder
COPY package*.json ./
COPY src/ ./src/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

CMD ["node", "src/server.js"]  # Run the app
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
```bash
# Docker Desktop might not be running
# Mac: Open Docker.app from Applications
# Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
```

### "Port 5001 already in use"
```bash
# Find what's using the port
lsof -i :5001

# Kill the process (replace PID)
kill -9 <PID>

# Or change port in docker-compose.yml
- "5002:5001"  # Use 5002 instead
```

### MongoDB connection fails
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify credentials in .env
MONGO_USER=dealpilot_admin
MONGO_PASSWORD=secure_db_password_change_this

# Try connecting manually
docker-compose exec mongodb mongosh -u dealpilot_admin -p secure_db_password_change_this
```

### Backend shows "unhealthy"
```bash
# View detailed logs
docker-compose logs backend

# Check if MongoDB and Redis are healthy
docker-compose ps

# Restart backend only
docker-compose restart backend

# Force full restart
docker-compose down && docker-compose up -d
```

### High disk usage
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove all volumes (WARNING: Deletes databases!)
docker volume prune

# Check volume sizes
docker system df
```

---

## Production Deployment

### Push to Docker Hub

```bash
# Make script executable (first time only)
chmod +x docker-push.sh

# Build and push
./docker-push.sh docker.io your-username

# Or manually:
docker build -t your-username/dealpilot-backend:latest ./backend
docker push your-username/dealpilot-backend:latest
```

### Deploy to Render

```bash
# Make script executable (first time only)
chmod +x render-deploy.sh

# Create render-deploy.env with your credentials
cp render-deploy.env.template render-deploy.env

# Edit render-deploy.env with MongoDB Atlas and Redis Cloud URLs

# Trigger deployment
./render-deploy.sh
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Performance Tips

### Reduce Image Size
- Use alpine variants (18-alpine)
- Multi-stage builds
- Remove dev dependencies

### Speed Up Builds
```bash
# Skip cache
docker-compose build --no-cache

# Build only what changed
docker-compose build --pull
```

### Monitor Resources
```bash
# Real-time stats
docker stats

# Check memory usage
docker-compose exec backend ps aux

# Check disk usage
docker system df
```

---

## Security Best Practices

- [ ] Change default MongoDB password
- [ ] Change default Redis password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Don't commit `.env` file (use `.env.example`)
- [ ] Use environment variables for all secrets
- [ ] Run containers as non-root user (if possible)
- [ ] Enable Docker security scanning
- [ ] Keep images up to date
- [ ] Use private Docker registry for sensitive images

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices for Python/Node.js Docker Images](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Clear cache: `docker-compose build --no-cache` |
| Port conflict | Change in docker-compose.yml: `"5002:5001"` |
| Out of disk | Run: `docker system prune -a --volumes` |
| Slow build | Use: `docker-compose build --pull` |
| Memory issues | Increase Docker desktop memory limit |
| Network issues | Restart Docker: `docker system restart` |

---

## Next Steps

1. ✅ Set up local Docker development
2. Configure MongoDB Atlas cloud database
3. Configure Redis Cloud
4. Deploy backend to Render
5. Deploy frontend to Vercel
6. Set up CI/CD pipeline
7. Monitor and optimize

---

**Last Updated**: April 11, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production
