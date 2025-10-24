// DAG: validate-test
// Cardinality checking tests

import { describe, expect, it } from "vitest";
import { cardinality } from "../../core/dsl/cardinality.js";
import { checkCardinality } from "../shape/cardinality-check.js";

describe("checkCardinality", () => {
  it("should accept valid exactly-one cardinality", () => {
    const card = cardinality({ min: 1, max: 1, required: true });
    const violations = checkCardinality("email", "john@example.com", card);
    expect(violations).toHaveLength(0);
  });

  it("should reject missing required property", () => {
    const card = cardinality({ min: 1, max: 1, required: true });
    const violations = checkCardinality("email", undefined, card);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.code).toBe("CARDINALITY_REQUIRED");
  });

  it("should accept missing optional property", () => {
    const card = cardinality({ min: 0, max: 1, required: false });
    const violations = checkCardinality("manager", undefined, card);
    expect(violations).toHaveLength(0);
  });

  it("should reject exceeding max cardinality", () => {
    const card = cardinality({ min: 0, max: 1, required: false });
    const violations = checkCardinality("email", ["a@example.com", "b@example.com"], card);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.code).toBe("CARDINALITY_MAX");
  });

  it("should reject below min cardinality", () => {
    const card = cardinality({ min: 2, max: 5, required: true });
    const violations = checkCardinality("tags", ["tag1"], card);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.code).toBe("CARDINALITY_MIN");
  });

  it("should accept array within cardinality range", () => {
    const card = cardinality({ min: 1, max: 3, required: true });
    const violations = checkCardinality("tags", ["tag1", "tag2"], card);
    expect(violations).toHaveLength(0);
  });

  it("should accept unbounded max cardinality", () => {
    const card = cardinality({ min: 1, max: undefined, required: true });
    const violations = checkCardinality("tags", ["tag1", "tag2", "tag3", "tag4"], card);
    expect(violations).toHaveLength(0);
  });

  it("should count single value as 1", () => {
    const card = cardinality({ min: 1, max: 1, required: true });
    const violations = checkCardinality("email", "john@example.com", card);
    expect(violations).toHaveLength(0);
  });

  it("should count null as 0", () => {
    const card = cardinality({ min: 1, max: 1, required: true });
    const violations = checkCardinality("email", null, card);
    expect(violations.some((v) => v.code === "CARDINALITY_REQUIRED")).toBe(true);
  });
});
