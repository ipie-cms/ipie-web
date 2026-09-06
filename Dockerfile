# syntax=docker/dockerfile:1
#
# ipie-web is a static bundle, not a service: there is no Node process at runtime. The build stage
# produces dist/ and the runtime stage is a web server that serves it.
#
#   docker build -t ipie-web .
#
# ONE IMAGE SERVES EVERY ENVIRONMENT. Nothing environment-specific is compiled in - the application
# reads /config.json at startup (ARCHITECTURE_PLAN.md, section 4). A deployment supplies that file
# by mounting over /usr/share/nginx/html/config.json; the copy baked in below holds local values so
# the image is runnable on its own, and must be replaced anywhere else.

# ---- Build stage -----------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /workspace

# Dependencies first, so a source-only change does not reinstall them. `npm ci` rather than
# `npm install`: it installs exactly what package-lock.json pins and fails if the two disagree,
# which is the property a reproducible build needs.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci

COPY . .

# `npm run build` is `tsc -b && vite build` - a type error fails the image build rather than
# producing a bundle. Tests and lint ran in CI before this point (master standards doc, section 13).
RUN npm run build

# ---- Runtime stage ---------------------------------------------------------
# nginx-unprivileged rather than the stock image: it already runs as a non-root user and listens on
# 8080, instead of starting as root to bind port 80 and needing its pid/cache paths patched to drop
# privileges. Nothing here needs a privileged port - the platform's ingress terminates TLS.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# SPA routing, cache headers, and the security headers that have to come from the serving layer
# because a static bundle cannot set its own.
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1
