# --- Build stage ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package.json bun.lock ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/
RUN NODE_ENV=development bun install --frozen-lockfile

COPY . .

ARG NITRO_PRESET=node-server
ARG VITE_APP_URL
ARG VITE_ANDROID_APK_URL
ENV NITRO_PRESET=${NITRO_PRESET}
ENV VITE_APP_URL=${VITE_APP_URL}
ENV VITE_ANDROID_APK_URL=${VITE_ANDROID_APK_URL}
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=2048

RUN bun run build

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
COPY package.json bun.lock ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile --production \
  && bun install drizzle-kit tsx dotenv \
  && chown -R app:app /app
# Nitro bundles sharp JS into dist; runtime still requires musl native binaries in node_modules/@img/.
RUN mkdir -p /tmp/sharp-install && cd /tmp/sharp-install \
  && npm init -y >/dev/null \
  && npm install --os=linux --libc=musl --cpu=x64 \
       sharp@0.35.1 \
       @img/sharp-linuxmusl-x64@0.35.1 \
       @img/sharp-libvips-linuxmusl-x64@1.3.0 \
  && mkdir -p /app/node_modules/@img \
  && cp -r node_modules/sharp /app/node_modules/sharp \
  && cp -r node_modules/@img/* /app/node_modules/@img/ \
  && rm -rf /tmp/sharp-install \
  && chown -R app:app /app/node_modules
COPY --from=builder --chown=app:app /app/apps/web/dist ./apps/web/dist
COPY --from=builder --chown=app:app /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=app:app /app/drizzle ./drizzle
COPY --from=builder --chown=app:app /app/db ./db
COPY --from=builder --chown=app:app /app/scripts ./scripts
COPY --from=builder --chown=app:app /app/apps/web/src ./apps/web/src
COPY --from=builder --chown=app:app /app/apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY --from=builder --chown=app:app /app/tsconfig.json ./tsconfig.json
COPY --chown=app:app scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER app

EXPOSE 3000

VOLUME ["/data/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
