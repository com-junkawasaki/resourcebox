// DAG: validate-test
// validateShape tests

import { describe, it, expect } from "vitest";
import { Type } from "@sinclair/typebox";
import { defineShape, iri, cardinality, range } from "@gftdcojp/shapebox-core";
import { validateShape } from "../shape/validate-shape.ts";

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

