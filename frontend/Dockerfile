# syntax=docker/dockerfile:1

# --- Build stage ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Nitro preset + public URL are baked in at build time (VITE_*).
ARG NITRO_PRESET=node-server
ARG VITE_APP_URL
ENV NITRO_PRESET=${NITRO_PRESET}
ENV VITE_APP_URL=${VITE_APP_URL}
ENV NODE_ENV=production

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
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000)).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server/index.mjs"]
