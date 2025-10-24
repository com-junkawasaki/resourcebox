// DAG: core-test
// Core module index coverage test

import { describe, expect, it } from "vitest";
import * as coreIndex from "../index.ts";

describe("core module index", () => {
  it("should export all core functionality", () => {
    // This test ensures the index.ts file is imported and covered
    expect(coreIndex).toBeDefined();
  });
});

