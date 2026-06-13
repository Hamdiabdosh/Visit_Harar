# --- Build stage ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package.json bun.lock ./
# Workspace manifests must be present before install (lockfile is frozen).
COPY packages ./packages
RUN NODE_ENV=development bun install --frozen-lockfile

COPY . .

ARG NITRO_PRESET=node-server
ARG VITE_APP_URL
ENV NITRO_PRESET=${NITRO_PRESET}
ENV VITE_APP_URL=${VITE_APP_URL}
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN bun run build

# Drop heavy build-only packages before copying to runner (keep drizzle-kit, tsx, etc.)
RUN rm -rf \
  node_modules/vite \
  node_modules/@vitejs \
  node_modules/nitro \
  node_modules/rolldown \
  node_modules/@rolldown \
  node_modules/typescript \
  node_modules/eslint \
  node_modules/prettier \
  node_modules/@eslint \
  node_modules/@typescript-eslint \
  node_modules/lightningcss \
  node_modules/@tailwindcss \
  2>/dev/null || true

# --- Production stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV UPLOAD_DIR=/data/uploads

RUN apk add --no-cache libstdc++ libgcc
RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /data/uploads && chown app:app /data/uploads

COPY --from=oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/bun.lock ./bun.lock
COPY --from=builder --chown=app:app /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=builder --chown=app:app /app/db ./db
COPY --from=builder --chown=app:app /app/scripts ./scripts
COPY --from=builder --chown=app:app /app/src ./src
COPY --from=builder --chown=app:app /app/tsconfig.json ./tsconfig.json
COPY --chown=app:app scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER app

EXPOSE 3000

VOLUME ["/data/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
