# Production Dockerfile for Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
