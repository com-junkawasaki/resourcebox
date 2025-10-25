// Shape.Define tests

import { describe, expect, it } from "vitest";
import { Class } from "../../onto/class.js";
import { FOAF } from "../../onto/namespace.js";
import { Define } from "../define.js";
import { Property } from "../property.js";

describe("Shape.Define", () => {
  const Person = Class({ iri: FOAF("Person") });

  it("should create a shape definition", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    expect(shape.targetClass).toBe(Person);
    expect(shape.property).toEqual({});
  });

  it("should support property definitions", () => {
    const nameProp = Property({
      path: FOAF("name"),
      datatype: "xsd:string",
      minCount: 1,
    });

    const shape = Define({
      targetClass: Person,
      property: {
        name: nameProp,
      },
    });

    expect(shape.property.name).toBe(nameProp);
  });

  it("should support closed shapes", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
      closed: true,
    });

    expect(shape.closed).toBe(true);
  });

  it("should support ignored properties", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
      ignoredProperties: [FOAF("homepage")],
    });

    expect(shape.ignoredProperties).toEqual([FOAF("homepage")]);
  });

  it("should support description", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
      description: "A person shape",
    });

    expect(shape.description).toBe("A person shape");
  });

  it("should handle optional parameters", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    expect(shape.closed).toBeUndefined();
    expect(shape.ignoredProperties).toBeUndefined();
    expect(shape.description).toBeUndefined();
  });
});
