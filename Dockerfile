FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl

# Copy packages
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Copy prisma schema so postinstall works
COPY backend/prisma ./backend/prisma

RUN npm install

# Copy source
COPY . .

# Build application
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/frontend/package*.json ./frontend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./backend/prisma

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
