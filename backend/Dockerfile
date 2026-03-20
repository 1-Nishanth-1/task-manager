# Multi-stage Dockerfile for Task Manager backend

# Use Debian-based image to ensure proper OpenSSL support for Prisma
FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* tsconfig.json prisma ./
RUN npm install

# Copy source
COPY src ./src

# Generate Prisma client and build TypeScript
RUN npx prisma generate && npm run build

# --- Production image ---
FROM node:20 AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and compiled code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy Prisma schema directly from build context
COPY prisma ./prisma

EXPOSE 4000

# Run database migrations on start, then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
