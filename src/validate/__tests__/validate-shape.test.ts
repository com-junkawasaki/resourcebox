// DAG: validate-test
// validateShape tests

import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { cardinality } from "../../core/dsl/cardinality.ts";
import { defineShape } from "../../core/dsl/define-shape.ts";
import { iri } from "../../core/dsl/iri.ts";
import { range } from "../../core/dsl/range.ts";
import { checkType } from "../shape/type-check.ts";
import { validateShape, validateShapeBatch } from "../shape/validate-shape.ts";

describe("validateShape", () => {
  const Person = defineShape({
    classIri: iri("ex:Person"),
    schema: Type.Object({
      "@id": Type.String({ format: "uri" }),
      "@type": Type.Array(Type.String({ format: "uri" })),
      name: Type.String(),
      email: Type.String(),
      manager: Type.Optional(Type.String({ format: "uri" })),
    }),
    props: {
      name: {
        predicate: iri("ex:hasName"),
        cardinality: cardinality({ min: 1, max: 1, required: true }),
        range: range.datatype(iri("xsd:string")),
      },
      email: {
        predicate: iri("ex:hasEmail"),
        cardinality: cardinality({ min: 1, max: 1, required: true }),
        range: range.datatype(iri("xsd:string")),
      },
      manager: {
        predicate: iri("ex:hasManager"),
        cardinality: cardinality({ min: 0, max: 1, required: false }),
        range: range.shape("ex:Person"),
      },
    },
  });

  it("should validate valid shape", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Person"],
      name: "John Doe",
      email: "john@example.com",
      manager: "ex:jane",
    });

    expect(report.ok).toBe(true);
    expect(report.violations).toHaveLength(0);
  });

  it("should reject missing @type", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      name: "John Doe",
      email: "john@example.com",
    });

    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "TYPE_MISMATCH")).toBe(true);
  });

  it("should reject wrong @type", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Project"], // wrong type
      name: "John Doe",
      email: "john@example.com",
    });

    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "TYPE_MISMATCH")).toBe(true);
  });

  it("should accept @type with multiple values including expected class", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Agent", "ex:Person", "foaf:Person"],
      name: "John Doe",
      email: "john@example.com",
    });

    expect(report.ok).toBe(true);
  });

  it("should reject missing required property", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Person"],
      name: "John Doe",
      // missing email
    });

    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "CARDINALITY_REQUIRED")).toBe(true);
  });

  it("should accept optional property omitted", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Person"],
      name: "John Doe",
      email: "john@example.com",
      // manager omitted
    });

    expect(report.ok).toBe(true);
  });

  it("should reject invalid IRI for shape reference", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Person"],
      name: "John Doe",
      email: "john@example.com",
      manager: "not-an-iri", // invalid IRI
    });

    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "SHAPE_REFERENCE_INVALID")).toBe(true);
  });

  it("should reject object value for datatype range", () => {
    const report = validateShape(Person, {
      "@id": "ex:john",
      "@type": ["ex:Person"],
      name: { value: "John" }, // should be string, not object
      email: "john@example.com",
    });

    expect(report.ok).toBe(false);
    expect(report.violations.some((v) => v.code === "DATATYPE_MISMATCH")).toBe(true);
  });

  it("should reject non-object data", () => {
    const report = validateShape(Person, "not an object");

    expect(report.ok).toBe(false);
    expect(report.violations).toHaveLength(1);
  });
});

describe("checkType", () => {
  it("should accept data with matching @type as string", () => {
    const violations = checkType({ "@type": "ex:Person" }, iri("ex:Person"));
    expect(violations).toHaveLength(0);
  });

  it("should accept data with matching @type in array", () => {
    const violations = checkType({ "@type": ["ex:Agent", "ex:Person"] }, iri("ex:Person"));
    expect(violations).toHaveLength(0);
  });

  it("should reject non-object data", () => {
    const violations = checkType("not an object", iri("ex:Person"));
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe("TYPE_MISMATCH");
    expect(violations[0].message).toContain("not an object");
  });

  it("should reject null data", () => {
    const violations = checkType(null, iri("ex:Person"));
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe("TYPE_MISMATCH");
  });

  it("should reject data with missing @type", () => {
    const violations = checkType({ "@id": "ex:john" }, iri("ex:Person"));
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe("TYPE_MISMATCH");
    expect(violations[0].message).toContain("missing or invalid");
  });

  it("should reject data with non-matching @type", () => {
    const violations = checkType({ "@type": "ex:Agent" }, iri("ex:Person"));
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe("TYPE_MISMATCH");
    expect(violations[0].message).toContain("does not include");
  });

  it("should handle @type array with non-string values", () => {
    const violations = checkType({ "@type": ["ex:Agent", 123, null] }, iri("ex:Person"));
    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe("TYPE_MISMATCH");
  });

  it("should accept when @type array contains matching type despite non-strings", () => {
    const violations = checkType({ "@type": ["ex:Person", 123, null] }, iri("ex:Person"));
    expect(violations).toHaveLength(0);
  });
});

describe("validateShapeBatch", () => {
  const Person = defineShape({
    classIri: iri("ex:Person"),
    schema: Type.Object({
      "@id": Type.String({ format: "uri" }),
      "@type": Type.Array(Type.String({ format: "uri" })),
      name: Type.String(),
    }),
    props: {
      name: {
        predicate: iri("ex:hasName"),
        cardinality: cardinality({ min: 1, max: 1, required: true }),
        range: range.datatype(iri("xsd:string")),
      },
    },
  });

  it("should validate multiple valid nodes", () => {
    const data = [
      {
        "@id": "ex:john",
        "@type": ["ex:Person"],
        name: "John",
      },
      {
        "@id": "ex:jane",
        "@type": ["ex:Person"],
        name: "Jane",
      },
    ];

    const reports = validateShapeBatch(Person, data);
    expect(reports).toHaveLength(2);
    expect(reports[0].ok).toBe(true);
    expect(reports[1].ok).toBe(true);
  });

  it("should detect errors in batch", () => {
    const data = [
      {
        "@id": "ex:john",
        "@type": ["ex:Person"],
        name: "John",
      },
      {
        "@id": "ex:jane",
        "@type": ["ex:Person"],
        // missing name
      },
    ];

    const reports = validateShapeBatch(Person, data);
    expect(reports).toHaveLength(2);
    expect(reports[0].ok).toBe(true);
    expect(reports[1].ok).toBe(false);
  });

  it("should handle empty array", () => {
    const reports = validateShapeBatch(Person, []);
    expect(reports).toHaveLength(0);
  });

  it("should skip special JSON-LD properties in validation", () => {
    const SpecialShape = defineShape({
      classIri: iri("ex:Special"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        "@context": Type.Optional(Type.Object({})),
      }),
      props: {
        "@id": {
          predicate: iri("ex:id"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        "@type": {
          predicate: iri("ex:type"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        "@context": {
          predicate: iri("ex:context"),
          cardinality: cardinality({ min: 0, max: 1, required: false }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });

    const report = validateShape(SpecialShape, {
      "@id": "ex:test",
      "@type": ["ex:Special"],
      "@context": {},
    });

    // Should not validate @id, @type, @context as regular properties
    expect(report.ok).toBe(true);
  });

  it("should handle shape with undefined propMeta", () => {
    const shape = {
      classIri: iri("ex:Test"),
      shapeId: "Test",
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        name: Type.String(),
      }),
      props: {
        name: undefined, // Explicitly undefined
      },
    } as unknown as ReturnType<typeof defineShape>;

    const report = validateShape(shape, {
      "@id": "ex:test",
      "@type": ["ex:Test"],
      name: "Test Name",
    });

    // Should skip undefined propMeta
    expect(report.ok).toBe(true);
  });
});
