# Multi-stage build cho Express API
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Cài dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source và build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm install -D typescript @types/node && npx tsc

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy artifacts cần thiết
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Non-root user cho bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
USER appuser

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
