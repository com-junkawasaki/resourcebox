// Onto.inference tests

import { describe, expect, it } from "vitest";
import { Class } from "../class.js";
import {
  areEquivalentClasses,
  createInferenceContext,
  getInverseProperty,
  isSubClassOf,
} from "../inference.js";
import { FOAF } from "../namespace.js";
import { Property } from "../property.js";

describe("createInferenceContext", () => {
  it("should create inference context from class and property definitions", () => {
    const Person = Class({ iri: FOAF("Person") });
    const Agent = Class({ iri: FOAF("Agent") });

    const nameProp = Property({
      iri: FOAF("name"),
      domain: [Person.iri],
      range: ["http://www.w3.org/2001/XMLSchema#string"],
    });

    const context = createInferenceContext(
      [
        { iri: Person.iri, superClasses: [Agent.iri] },
        { iri: Agent.iri, superClasses: [] },
      ],
      [
        {
          iri: nameProp.iri,
          domain: [Person.iri],
          range: ["http://www.w3.org/2001/XMLSchema#string"],
        },
      ]
    );

    expect(context.classes.get(Person.iri)?.has(Agent.iri)).toBe(true);
    expect(context.domains.get(nameProp.iri)?.has(Person.iri)).toBe(true);
    expect(context.ranges.get(nameProp.iri)?.has("http://www.w3.org/2001/XMLSchema#string")).toBe(
      true
    );
  });

  it("should handle transitive subclass relationships", () => {
    const Thing = Class({ iri: "http://www.w3.org/2002/07/owl#Thing" });
    const Agent = Class({ iri: FOAF("Agent") });
    const Person = Class({ iri: FOAF("Person") });

    const context = createInferenceContext(
      [
        { iri: Person.iri, superClasses: [Agent.iri] },
        { iri: Agent.iri, superClasses: [Thing.iri] },
        { iri: Thing.iri, superClasses: [] },
      ],
      []
    );

    expect(isSubClassOf(context, Person.iri, Thing.iri)).toBe(true);
    expect(isSubClassOf(context, Person.iri, Agent.iri)).toBe(true);
    expect(isSubClassOf(context, Agent.iri, Thing.iri)).toBe(true);
  });

  it("should handle transitive subproperty relationships", () => {
    const prop1 = Property({ iri: "http://example.org/prop1" });
    const prop2 = Property({ iri: "http://example.org/prop2" });
    const prop3 = Property({ iri: "http://example.org/prop3" });

    const context = createInferenceContext(
      [],
      [
        { iri: prop2.iri, superProperties: [prop1.iri] },
        { iri: prop3.iri, superProperties: [prop2.iri] },
      ]
    );

    expect(context.properties.get(prop3.iri)?.has(prop1.iri)).toBe(true);
    expect(context.properties.get(prop3.iri)?.has(prop2.iri)).toBe(true);
  });
});

describe("isSubClassOf", () => {
  it("should check subclass relationships including transitivity", () => {
    const context = createInferenceContext(
      [
        { iri: "http://example.org/A", superClasses: ["http://example.org/B"] },
        { iri: "http://example.org/B", superClasses: ["http://example.org/C"] },
      ],
      []
    );

    expect(isSubClassOf(context, "http://example.org/A", "http://example.org/C")).toBe(true);
    expect(isSubClassOf(context, "http://example.org/A", "http://example.org/B")).toBe(true);
    expect(isSubClassOf(context, "http://example.org/A", "http://example.org/A")).toBe(true);
    expect(isSubClassOf(context, "http://example.org/C", "http://example.org/A")).toBe(false);
  });

  it("should check subclass relationships", () => {
    const context = createInferenceContext(
      [
        {
          iri: "http://example.org/Person",
          superClasses: ["http://example.org/Agent"],
        },
        { iri: "http://example.org/Agent", superClasses: [] },
      ],
      []
    );

    expect(isSubClassOf(context, "http://example.org/Person", "http://example.org/Agent")).toBe(
      true
    );
    expect(isSubClassOf(context, "http://example.org/Agent", "http://example.org/Person")).toBe(
      false
    );
  });
});

describe("areEquivalentClasses", () => {
  it("should check if two classes are equivalent", () => {
    const context = createInferenceContext(
      [
        {
          iri: "http://example.org/Person",
          equivalentClasses: ["http://example.org/Human", "http://example.org/Individual"],
        },
      ],
      []
    );

    expect(
      areEquivalentClasses(context, "http://example.org/Person", "http://example.org/Human")
    ).toBe(true);
    expect(
      areEquivalentClasses(context, "http://example.org/Person", "http://example.org/Individual")
    ).toBe(true);
    expect(
      areEquivalentClasses(context, "http://example.org/Human", "http://example.org/Individual")
    ).toBe(true); // transitive through Person
    expect(
      areEquivalentClasses(context, "http://example.org/Person", "http://example.org/Unknown")
    ).toBe(false);
  });
});

describe("getInverseProperty", () => {
  it("should get inverse properties", () => {
    const context = createInferenceContext(
      [],
      [
        {
          iri: "http://example.org/knows",
          inverseOf: "http://example.org/knownBy",
        },
      ]
    );

    expect(getInverseProperty(context, "http://example.org/knows")).toBe(
      "http://example.org/knownBy"
    );
    expect(getInverseProperty(context, "http://example.org/knownBy")).toBe(
      "http://example.org/knows"
    );
    expect(getInverseProperty(context, "http://example.org/unrelated")).toBeUndefined();
  });
});
