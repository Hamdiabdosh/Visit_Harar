// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { config as loadEnvFile } from "dotenv";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const repoRoot = path.resolve(import.meta.dirname, "../..");
loadEnvFile({ path: path.join(repoRoot, ".env") });
loadEnvFile({ path: path.join(repoRoot, ".env.local"), override: true });

const nitroPreset =
  process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "node-server");

export default defineConfig({
  // Coolify/Docker: node-server. Vercel: set NITRO_PRESET=vercel or deploy on Vercel (auto-detected).
  nitro: {
    preset: nitroPreset,
    // Smaller Nitro rollup — helps low-RAM VPS Docker builds avoid OOM SIGKILL.
    sourceMap: false,
    // sharp has native bindings — must be traced, not bundled into _libs/sharp.mjs.
    traceDeps: ["sharp*", "@img/sharp*"],
  },
  vite: {
    // Load .env from monorepo root (not apps/web/)
    envDir: repoRoot,
    build: {
      sourcemap: false,
    },
    preview: {
      // Prerender during Docker build binds to loopback inside the container.
      host: "127.0.0.1",
    },
    resolve: {
      alias: {
        "~": repoRoot,
        "@visit-harar/shared": path.resolve(
          repoRoot,
          "packages/shared/src/index.ts",
        ),
        "@visit-harar/api-client": path.resolve(
          repoRoot,
          "packages/api-client/src/index.ts",
        ),
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
