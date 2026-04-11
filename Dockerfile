FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source
COPY backend/src ./src

# Copy .env example
COPY backend/.env.example .env

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/health', (r) => { if (r.statusCode !== 200) process.exit(1) })" || exit 1

# Start application
CMD ["node", "src/server.js"]
