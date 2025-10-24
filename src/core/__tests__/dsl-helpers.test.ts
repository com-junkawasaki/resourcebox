// DAG: core-test
// DSL helper functions tests

import { describe, expect, it } from "vitest";
import {
  cardinality,
  exactlyOne,
  oneOrMore,
  optional,
  zeroOrMore,
} from "../dsl/cardinality.ts";
import { classIri, datatypeIri, iri, propertyIri } from "../dsl/iri.ts";

describe("cardinality helpers", () => {
  it("should create cardinality with defaults", () => {
    const card = cardinality({});
    expect(card.min).toBe(0);
    expect(card.max).toBeUndefined();
    expect(card.required).toBe(false);
  });

  it("should create cardinality with explicit values", () => {
    const card = cardinality({ min: 2, max: 5, required: true });
    expect(card.min).toBe(2);
    expect(card.max).toBe(5);
    expect(card.required).toBe(true);
  });

  it("should auto-set required=true when min >= 1", () => {
    const card = cardinality({ min: 1 });
    expect(card.required).toBe(true);
  });

  it("should throw on invalid cardinality", () => {
    expect(() => cardinality({ min: -1 })).toThrow(/Invalid cardinality/);
    expect(() => cardinality({ min: 2, max: 1 })).toThrow(/Invalid cardinality/);
  });

  it("should create exactlyOne pattern", () => {
    const card = exactlyOne();
    expect(card.min).toBe(1);
    expect(card.max).toBe(1);
    expect(card.required).toBe(true);
  });

  it("should create optional pattern", () => {
    const card = optional();
    expect(card.min).toBe(0);
    expect(card.max).toBe(1);
    expect(card.required).toBe(false);
  });

  it("should create oneOrMore pattern", () => {
    const card = oneOrMore();
    expect(card.min).toBe(1);
    expect(card.max).toBeUndefined();
    expect(card.required).toBe(true);
  });

  it("should create zeroOrMore pattern", () => {
    const card = zeroOrMore();
    expect(card.min).toBe(0);
    expect(card.max).toBeUndefined();
    expect(card.required).toBe(false);
  });
});

describe("iri helpers", () => {
  it("should create generic IRI", () => {
    const uri = iri("ex:Person");
    expect(uri).toBe("ex:Person");
  });

  it("should create IRI with semantic tag", () => {
    const uri = iri<"Class">("ex:Person");
    expect(uri).toBe("ex:Person");
  });

  it("should create class IRI", () => {
    const uri = classIri("ex:Person");
    expect(uri).toBe("ex:Person");
  });

  it("should create property IRI", () => {
    const uri = propertyIri("ex:hasEmail");
    expect(uri).toBe("ex:hasEmail");
  });

  it("should create datatype IRI", () => {
    const uri = datatypeIri("xsd:string");
    expect(uri).toBe("xsd:string");
  });

  it("should handle full URIs", () => {
    const uri = iri("http://example.org/Person");
    expect(uri).toBe("http://example.org/Person");
  });
});

