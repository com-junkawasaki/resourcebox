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
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/__tests__/**",
        "src/**/types.ts", // Type-only files
        "src/core/types/shape.ts", // Type-only file
        "src/core/typecheck/cardinality-optional.ts", // Type-level only
        "src/validate/report/index.ts", // Type-only file
      ],
      all: true,
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});
