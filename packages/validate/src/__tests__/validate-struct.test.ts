// DAG: validate-test
// validateStruct tests

import { cardinality, defineShape, iri, range } from "@gftdcojp/shapebox-core";
import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { validateStruct } from "../struct/validate-struct.ts";

describe("validateStruct", () => {
  const Person = defineShape({
    classIri: iri("ex:Person"),
    schema: Type.Object({
      "@id": Type.String({ format: "uri" }),
      "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
      email: Type.String({ format: "email" }),
      age: Type.Optional(Type.Number({ minimum: 0 })),
    }),
    props: {
      email: {
        predicate: iri("ex:hasEmail"),
        cardinality: cardinality({ min: 1, max: 1, required: true }),
        range: range.datatype(iri("xsd:string")),
      },
      age: {
        predicate: iri("ex:hasAge"),
        cardinality: cardinality({ min: 0, max: 1, required: false }),
        range: range.datatype(iri("xsd:integer")),
      },
    },
  });

  it("should validate valid data", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      email: "john@example.com",
      age: 30,
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should accept data without optional fields", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      email: "john@example.com",
    });

    expect(result.ok).toBe(true);
  });

  it("should reject missing required field", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      // missing email
    });

    expect(result.ok).toBe(false);
    // Check for "required" error keyword rather than path
    expect(
      result.errors.some((e) => e.keyword === "required" || e.message?.includes("email"))
    ).toBe(true);
  });

  it("should reject invalid email format", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      email: "not-an-email",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.keyword === "format")).toBe(true);
  });

  it("should reject invalid URI format", () => {
    const result = validateStruct(Person, {
      "@id": "not a uri",
      "@type": ["ex:Person"],
      email: "john@example.com",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.path === "/@id")).toBe(true);
  });

  it("should reject wrong type", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      email: 123, // should be string
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.keyword === "type")).toBe(true);
  });

  it("should reject negative age", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": ["ex:Person"],
      email: "john@example.com",
      age: -5,
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.keyword === "minimum")).toBe(true);
  });

  it("should reject empty @type array", () => {
    const result = validateStruct(Person, {
      "@id": "http://example.org/john",
      "@type": [],
      email: "john@example.com",
    });

    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.keyword === "minItems")).toBe(true);
  });
});
