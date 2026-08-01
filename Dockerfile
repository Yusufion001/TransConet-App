FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Copy source
COPY . .

# Generate Prisma client and build application
RUN npm run postinstall
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
