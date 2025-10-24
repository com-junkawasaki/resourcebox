// DAG: validate-test
// Range checking tests

import { describe, expect, it } from "vitest";
import { iri } from "../../core/dsl/iri.js";
import { range } from "../../core/dsl/range.js";
import { checkRange } from "../shape/range-check.js";

describe("checkRange", () => {
  describe("datatype range", () => {
    const stringRange = range.datatype(iri("xsd:string"));

    it("should accept string value", () => {
      const violations = checkRange("name", "John Doe", stringRange);
      expect(violations).toHaveLength(0);
    });

    it("should accept number value (primitive)", () => {
      const intRange = range.datatype(iri("xsd:integer"));
      const violations = checkRange("age", 30, intRange);
      expect(violations).toHaveLength(0);
    });

    it("should accept boolean value (primitive)", () => {
      const boolRange = range.datatype(iri("xsd:boolean"));
      const violations = checkRange("active", true, boolRange);
      expect(violations).toHaveLength(0);
    });

    it("should reject object value for datatype", () => {
      const violations = checkRange("name", { value: "John" }, stringRange);
      expect(violations).toHaveLength(1);
      expect(violations[0]?.code).toBe("DATATYPE_MISMATCH");
    });

    it("should accept array of primitives", () => {
      const violations = checkRange("names", ["John", "Jane"], stringRange);
      expect(violations).toHaveLength(0);
    });

    it("should reject array with object", () => {
      const violations = checkRange("names", ["John", { value: "Jane" }], stringRange);
      expect(violations.some((v) => v.code === "DATATYPE_MISMATCH")).toBe(true);
    });
  });

  describe("shape range", () => {
    const personRange = range.shape("ex:Person");

    it("should accept valid IRI", () => {
      const violations = checkRange("manager", "ex:jane", personRange);
      expect(violations).toHaveLength(0);
    });

    it("should accept full URI", () => {
      const violations = checkRange("manager", "http://example.org/jane", personRange);
      expect(violations).toHaveLength(0);
    });

    it("should reject non-string value", () => {
      const violations = checkRange("manager", 123, personRange);
      expect(violations).toHaveLength(1);
      expect(violations[0]?.code).toBe("SHAPE_REFERENCE_INVALID");
    });

    it("should reject invalid IRI string", () => {
      const violations = checkRange("manager", "not an iri", personRange);
      expect(violations).toHaveLength(1);
      expect(violations[0]?.code).toBe("SHAPE_REFERENCE_INVALID");
    });

    it("should accept array of valid IRIs", () => {
      const violations = checkRange("members", ["ex:john", "ex:jane"], personRange);
      expect(violations).toHaveLength(0);
    });

    it("should reject array with invalid IRI", () => {
      const violations = checkRange("members", ["ex:john", "invalid"], personRange);
      expect(violations.some((v) => v.code === "SHAPE_REFERENCE_INVALID")).toBe(true);
    });
  });

  it("should skip validation for undefined value", () => {
    const stringRange = range.datatype(iri("xsd:string"));
    const violations = checkRange("name", undefined, stringRange);
    expect(violations).toHaveLength(0);
  });

  it("should skip validation for null value", () => {
    const stringRange = range.datatype(iri("xsd:string"));
    const violations = checkRange("name", null, stringRange);
    expect(violations).toHaveLength(0);
  });
});
