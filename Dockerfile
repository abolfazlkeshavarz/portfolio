# syntax=docker/dockerfile:1

# ---------------------------------------------------------------- build stage
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first so a content-only edit doesn't re-install the tree.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ---------------------------------------------------------------- serve stage
# The build output is plain static files, so the runtime image is just nginx —
# no Node process in production, nothing to keep alive, nothing to patch
# beyond the web server itself.
FROM nginx:1.27-alpine

COPY deploy/nginx/site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
