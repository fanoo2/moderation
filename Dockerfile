# Production build for production optimization
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies  
RUN npm ci && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S moderation -u 1001

# Copy built application (build locally before Docker)
COPY --chown=moderation:nodejs dist/ ./dist/

# Change ownership of node_modules to the application user
RUN chown -R moderation:nodejs .

# Switch to non-root user
USER moderation

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/app.js"]