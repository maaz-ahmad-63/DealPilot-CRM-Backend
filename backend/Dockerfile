# Multi-stage build for backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files from backend directory
COPY backend/package*.json ./
COPY backend/src/ ./src/

# Create necessary directories
RUN mkdir -p uploads logs data

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Run the application
CMD ["node", "src/server.js"]
