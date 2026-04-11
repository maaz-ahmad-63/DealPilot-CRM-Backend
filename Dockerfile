FROM node:18-alpine

WORKDIR /app

# Copy backend directory entirely
COPY backend/ .

# Install production dependencies
RUN npm install --omit=dev

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/data /app/uploads && \
    chown -R 1001:1001 /app

# Create app user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 10000

# Health check - wait for database connection
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5001) + '/health', (r) => { if (r.statusCode !== 200) throw new Error() })" || exit 1

# Start application
CMD ["node", "src/server.js"]
