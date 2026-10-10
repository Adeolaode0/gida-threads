# Multi-stage Dockerfile for Gida Threads Full-Stack E-Commerce Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy application sources
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built code
COPY --from=builder /app /app

EXPOSE 5000

CMD ["node", "backend/server.js"]
