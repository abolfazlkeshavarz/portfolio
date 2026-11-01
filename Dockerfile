# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- build stage
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first so a content-only edit doesn't re-install the tree.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ---------------------------------------------------------------- run stage
# A small Node server (no npm dependencies) serves the built site, the editable
# content and the /aboli control panel API. Everything the panel changes lives
# in /data, which docker-compose mounts as a named volume so it survives
# rebuilds and redeploys.
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    DIST_DIR=/app/dist \
    SEED_FILE=/app/seed/content.json

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/content/content.json ./seed/content.json
COPY server ./server

RUN mkdir -p /data && chown -R node:node /data
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

CMD ["node", "server/index.mjs"]
