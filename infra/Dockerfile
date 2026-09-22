# syntax=docker/dockerfile:1

# Multi-stage production build. Run from the repository root:
#   docker build -f infra/Dockerfile -t ado .

# ---- Dependencies (full, including dev) ----
# sqlite3 tries to download a prebuilt binary first and only falls back to
# compiling from source (node-gyp) when none matches the platform — python3/make/g++
# cover that fallback case so the install never hard-fails.
FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---- Build (compile TypeScript, bundle frontend assets) ----
FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node ace build

# ---- Production dependencies only ----
FROM node:24-slim AS production-deps
WORKDIR /app
RUN apt-get update && apt-get install --no-install-recommends -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/build/package.json /app/build/package-lock.json ./
COPY .npmrc ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/build ./
COPY --from=production-deps /app/node_modules ./node_modules
RUN mkdir -p tmp && useradd --system --create-home appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 3333
CMD ["node", "bin/server.js"]
