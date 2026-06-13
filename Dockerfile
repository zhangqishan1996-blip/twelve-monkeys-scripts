# ── Multi-stage Dockerfile ─────────────────────────────────────
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS production
WORKDIR /app/server

# Install only production deps
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/src ./src

# Copy built frontend into server's static folder
COPY --from=frontend-builder /app/client/dist ../client/dist

# Security: run as non-root user
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/index.js"]
