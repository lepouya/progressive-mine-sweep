import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import pkg from "./package.json";

function pretty(s: any): string {
  return String(s)
    .replace(/\W/g, " ")
    .replace(/(?:^|\s)\S/g, (c: string) => c.toUpperCase());
}

export default defineConfig(({ mode }) => ({
  base: "",
  plugins: [react()],
  define: {
    ...Object.fromEntries(
      Object.entries(pkg)
        .filter(([, s]) => typeof s === "string")
        .map(([k, v]) => [
          `import.meta.env.${k.toUpperCase()}`,
          JSON.stringify(k === "name" ? pretty(v) : v),
        ]),
    ),
  },
  build: {
    chunkSizeWarningLimit: 1024,
    sourcemap: mode === "development",
    minify: mode === "production",
    cssMinify: mode === "production",
    rollupOptions: {
      output: {
        manualChunks: function (id) {
          if (id.includes("node_modules")) {
            return "vendors";
          }
        },
      },
    },
  },
}));
