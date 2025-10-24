import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    watch: false,
    ui: false,
    reporters: ["dot"],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
