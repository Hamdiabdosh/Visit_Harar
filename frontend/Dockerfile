# --- Build stage ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Coolify may inject NODE_ENV=production at build time — force dev deps for vite/nitro.
ENV NODE_ENV=development

COPY package.json bun.lock ./
# Inline NODE_ENV so Coolify build-time NODE_ENV=production cannot skip devDependencies.
RUN NODE_ENV=development bun install --frozen-lockfile

COPY . .

# Nitro preset + public URL are baked in at build time (VITE_*).
ARG NITRO_PRESET=node-server
ARG VITE_APP_URL
ENV NITRO_PRESET=${NITRO_PRESET}
ENV VITE_APP_URL=${VITE_APP_URL}
ENV NODE_ENV=production
# Low-RAM VPS: cap Node heap so the OOM killer is less likely during Nitro rollup.
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN bun run build

# --- Production stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV UPLOAD_DIR=/data/uploads

RUN addgroup -S app && adduser -S app -G app
RUN mkdir -p /data/uploads && chown app:app /data/uploads

COPY --from=builder --chown=app:app /app/dist ./dist

USER app

EXPOSE 3000

VOLUME ["/data/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server/index.mjs"]
