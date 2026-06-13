#!/usr/bin/env tsx
/**
 * Pre-deploy checks for Coolify (Docker Compose). Run from repo root:
 *   bun run deploy:preflight
 */
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const errors: string[] = [];
const warnings: string[] = [];

function requirePath(relativePath: string, label: string) {
  if (!existsSync(relativePath)) {
    errors.push(`Missing ${label}: ${relativePath}`);
  }
}

requirePath("apps/web/package.json", "web package");
requirePath("apps/web/src/routes/index.tsx", "web routes");
requirePath("docker-compose.yml", "compose file");
requirePath("Dockerfile", "Dockerfile");
requirePath("scripts/docker-entrypoint.sh", "entrypoint");

if (existsSync(".dockerignore")) {
  const text = readFileSync(".dockerignore", "utf8");
  if (/^apps\/\*\/\*\s*$/m.test(text) || /^apps\/\*\*\s*$/m.test(text)) {
    errors.push(
      ".dockerignore excludes all of apps/ — Coolify build will fail. Keep apps/web/ in the image context.",
    );
  }
  if (text.includes("apps/flutter/**")) {
    console.log("✓ Flutter excluded from Docker context");
  }
}

const apkPath = "apps/web/public/downloads/visit-harar.apk";
if (!existsSync(apkPath)) {
  warnings.push(
    `No Android APK at ${apkPath}. Homepage download will 404 until you run: bun run flutter:apk:web (then redeploy).`,
  );
} else {
  console.log("✓ Android APK present for static hosting");
}

try {
  execSync("docker compose config -q", { stdio: "pipe" });
  console.log("✓ docker compose config valid");
} catch {
  warnings.push(
    "Could not validate docker compose (is Docker installed?). Skipping compose check.",
  );
}

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✗ ${e}`);

if (errors.length > 0) {
  console.error("\nPreflight failed. Fix the errors above before deploying to Coolify.");
  process.exit(1);
}

console.log("\nPreflight passed.");
if (warnings.length > 0) {
  console.log("Review warnings above — deploy can proceed but some features may be incomplete.");
}
