// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const nitroPreset =
  process.env.NITRO_PRESET ?? (process.env.VERCEL ? "vercel" : "node-server");

export default defineConfig({
  // Coolify/Docker: node-server. Vercel: set NITRO_PRESET=vercel or deploy on Vercel (auto-detected).
  nitro: {
    preset: nitroPreset,
    // Smaller Nitro rollup — helps low-RAM VPS Docker builds avoid OOM SIGKILL.
    sourceMap: false,
  },
  vite: {
    build: {
      sourcemap: false,
    },
    preview: {
      // Prerender during Docker build binds to loopback inside the container.
      host: "127.0.0.1",
    },
    resolve: {
      alias: {
        "~": path.resolve(import.meta.dirname, "."),
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
