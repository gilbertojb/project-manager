import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    globals: true,
    root: "./",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
