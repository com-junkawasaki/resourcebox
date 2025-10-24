// DAG: core-test
// Type utilities tests

import { describe, it, expect } from "vitest";
import { isIRI, getIRIPrefix, getIRILocalName } from "../types/iri.ts";
import { validateCardinalityStructure, satisfiesCardinality } from "../types/cardinality.ts";
import { isDatatypeRange, isShapeRange } from "../types/range.ts";
import { validatePropertyMeta } from "../types/property.ts";
import { iri } from "../dsl/iri.ts";
import { cardinality } from "../dsl/cardinality.ts";
import { range } from "../dsl/range.ts";

describe("IRI utilities", () => {
  it("should detect IRI format", () => {
    expect(isIRI("ex:Person")).toBe(true);
    expect(isIRI("http://example.org/Person")).toBe(true);
    expect(isIRI("https://example.org/Person")).toBe(true);
    expect(isIRI("urn:uuid:123")).toBe(true);
    expect(isIRI("not-an-iri")).toBe(false);
  });
  
  it("should extract IRI prefix", () => {
    expect(getIRIPrefix(iri("ex:Person"))).toBe("ex");
    expect(getIRIPrefix(iri("foaf:name"))).toBe("foaf");
    expect(getIRIPrefix(iri("http://example.org/Person"))).toBeUndefined();
  });
  
  it("should extract IRI local name", () => {
    expect(getIRILocalName(iri("ex:Person"))).toBe("Person");
    expect(getIRILocalName(iri("http://example.org/ont#Person"))).toBe("Person");
    expect(getIRILocalName(iri("http://example.org/ont/Person"))).toBe("Person");
  });
});

describe("Cardinality validation", () => {
  it("should validate valid cardinality", () => {
    expect(validateCardinalityStructure({ min: 0, max: 1, required: false })).toBeUndefined();
    expect(validateCardinalityStructure({ min: 1, max: 1, required: true })).toBeUndefined();
    expect(validateCardinalityStructure({ min: 1, max: undefined, required: true })).toBeUndefined();
  });
  
  it("should reject negative min", () => {
    expect(validateCardinalityStructure({ min: -1, max: 1, required: false })).toContain("min must be >= 0");
  });
  
  it("should reject max < min", () => {
    expect(validateCardinalityStructure({ min: 2, max: 1, required: false })).toContain("max");
  });
  
  it("should warn on required=true with min=0", () => {
    expect(validateCardinalityStructure({ min: 0, max: 1, required: true })).toContain("required=true");
  });
  
  it("should check satisfiesCardinality", () => {
    const card = cardinality({ min: 1, max: 3, required: true });
    expect(satisfiesCardinality(card, 0)).toBe(false);
    expect(satisfiesCardinality(card, 1)).toBe(true);
    expect(satisfiesCardinality(card, 2)).toBe(true);
    expect(satisfiesCardinality(card, 3)).toBe(true);
    expect(satisfiesCardinality(card, 4)).toBe(false);
  });
});

describe("Range type guards", () => {
  it("should identify datatype range", () => {
    const datatypeRange = range.datatype(iri("xsd:string"));
    expect(isDatatypeRange(datatypeRange)).toBe(true);
    expect(isShapeRange(datatypeRange)).toBe(false);
  });
  
  it("should identify shape range", () => {
    const shapeRange = range.shape("ex:Person");
    expect(isShapeRange(shapeRange)).toBe(true);
    expect(isDatatypeRange(shapeRange)).toBe(false);
  });
});

describe("PropertyMeta validation", () => {
  it("should validate functional property", () => {
    const validFunctional = {
      predicate: iri("ex:hasEmail"),
      cardinality: cardinality({ min: 1, max: 1, required: true }),
      range: range.datatype(iri("xsd:string")),
      functional: true,
    };
    expect(validatePropertyMeta(validFunctional)).toBeUndefined();
    
    const invalidFunctional = {
      predicate: iri("ex:hasEmail"),
      cardinality: cardinality({ min: 1, max: 5, required: true }),
      range: range.datatype(iri("xsd:string")),
      functional: true,
    };
    expect(validatePropertyMeta(invalidFunctional)).toContain("Functional");
  });
  
  it("should validate symmetric property", () => {
    const invalidSymmetric = {
      predicate: iri("ex:knows"),
      cardinality: cardinality({ min: 0, max: undefined, required: false }),
      range: range.datatype(iri("xsd:string")),
      symmetric: true,
    };
    expect(validatePropertyMeta(invalidSymmetric)).toContain("Symmetric");
    
    const validSymmetric = {
      predicate: iri("ex:knows"),
      cardinality: cardinality({ min: 0, max: undefined, required: false }),
      range: range.shape("ex:Person"),
      symmetric: true,
    };
    expect(validatePropertyMeta(validSymmetric)).toBeUndefined();
  });
});

