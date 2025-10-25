// Onto.Property tests

import { describe, expect, it } from "vitest";
import { FOAF } from "../../onto/namespace.js";
import { Property, getPropertyIRI, isProperty } from "../property.js";

describe("Onto.Property", () => {
  it("should create a property definition", () => {
    const name = Property({
      iri: FOAF("name"),
      label: "name",
      functional: true,
    });

    expect(name.kind).toBe("Property");
    expect(name.iri).toBe(FOAF("name"));
    expect(name.label).toBe("name");
    expect(name.functional).toBe(true);
  });

  it("should support domain and range", () => {
    const knows = Property({
      iri: FOAF("knows"),
      domain: [FOAF("Person")],
      range: [FOAF("Person")],
    });

    expect(knows.domain).toEqual([FOAF("Person")]);
    expect(knows.range).toEqual([FOAF("Person")]);
  });

  it("should support OWL characteristics", () => {
    const age = Property({
      iri: FOAF("age"),
      functional: true,
      inverseFunctional: false,
      transitive: false,
      symmetric: false,
      asymmetric: false,
      reflexive: false,
      irreflexive: false,
    });

    expect(age.functional).toBe(true);
    expect(age.inverseFunctional).toBe(false);
    expect(age.transitive).toBe(false);
    expect(age.symmetric).toBe(false);
    expect(age.asymmetric).toBe(false);
    expect(age.reflexive).toBe(false);
    expect(age.irreflexive).toBe(false);
  });

  it("should support inverseOf", () => {
    const parent = Property({
      iri: "ex:parent",
    });

    const child = Property({
      iri: "ex:child",
      inverseOf: parent,
    });

    expect(child.inverseOf).toBe(parent);
  });

  it("should support subPropertyOf", () => {
    const name = Property({
      iri: FOAF("name"),
    });

    const fullName = Property({
      iri: "ex:fullName",
      subPropertyOf: [name],
    });

    expect(fullName.subPropertyOf).toEqual([name]);
  });

  it("should support optional parameters", () => {
    const prop = Property({
      iri: FOAF("name"),
    });

    expect(prop.label).toBeUndefined();
    expect(prop.comment).toBeUndefined();
    expect(prop.domain).toBeUndefined();
    expect(prop.range).toBeUndefined();
    expect(prop.subPropertyOf).toBeUndefined();
    expect(prop.functional).toBeUndefined();
    expect(prop.inverseFunctional).toBeUndefined();
    expect(prop.transitive).toBeUndefined();
    expect(prop.symmetric).toBeUndefined();
    expect(prop.asymmetric).toBeUndefined();
    expect(prop.reflexive).toBeUndefined();
    expect(prop.irreflexive).toBeUndefined();
    expect(prop.inverseOf).toBeUndefined();
  });
});

describe("Onto.isProperty", () => {
  it("should return true for property entities", () => {
    const name = Property({
      iri: FOAF("name"),
    });

    expect(isProperty(name)).toBe(true);
  });

  it("should return false for non-property entities", () => {
    expect(isProperty("string")).toBe(false);
    expect(isProperty({})).toBe(false);
    expect(isProperty(null)).toBe(false);
  });
});

describe("Onto.getPropertyIRI", () => {
  it("should return IRI from property", () => {
    const name = Property({
      iri: FOAF("name"),
    });

    expect(getPropertyIRI(name)).toBe(FOAF("name"));
  });

  it("should return IRI string as-is", () => {
    const iri = "http://example.org/name";
    expect(getPropertyIRI(iri)).toBe(iri);
  });
});
