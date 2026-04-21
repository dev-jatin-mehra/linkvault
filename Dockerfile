# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci

# Runtime stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/node_modules ./node_modules
COPY server .

# Create logs directory
RUN mkdir -p /app/logs

EXPOSE 4000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
