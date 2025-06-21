# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate && npm run build

# Prune dev dependencies
RUN npm prune --omit=dev


# Production stage
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 4002

CMD ["node", "--require", "./dist/telemetry/otel.js", "dist/index.js"]