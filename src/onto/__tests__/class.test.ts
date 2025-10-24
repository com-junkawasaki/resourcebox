// Onto.Class tests

import { describe, expect, it } from "vitest";
import { Class, isClass } from "../class.js";
import { FOAF } from "../namespace.js";

describe("Onto.Class", () => {
  it("should create a class definition", () => {
    const Person = Class({
      iri: FOAF("Person"),
      label: "Person",
      comment: "A person",
    });
    
    expect(Person.kind).toBe("Class");
    expect(Person.iri).toBe(FOAF("Person"));
    expect(Person.label).toBe("Person");
    expect(Person.comment).toBe("A person");
  });
  
  it("should support subClassOf", () => {
    const Agent = Class({
      iri: FOAF("Agent"),
      label: "Agent",
    });
    
    const Person = Class({
      iri: FOAF("Person"),
      label: "Person",
      subClassOf: [Agent],
    });
    
    expect(Person.subClassOf).toContain(Agent);
  });
  
  it("should identify class entities", () => {
    const Person = Class({
      iri: FOAF("Person"),
    });
    
    expect(isClass(Person)).toBe(true);
    expect(isClass("not a class")).toBe(false);
  });
});

