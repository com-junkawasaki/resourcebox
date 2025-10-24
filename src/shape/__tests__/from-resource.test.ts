// Shape.fromResource tests

import { describe, expect, it } from "vitest";
import { fromResource } from "../from-resource.js";
import { Object as ResourceObject } from "../../resource/object.js";
import { String, Number } from "../../resource/primitives.js";
import { Ref } from "../../resource/ref.js";
import { FOAF } from "../../onto/namespace.js";
import { Class } from "../../onto/class.js";

describe("Shape.fromResource", () => {
  const Person = Class({ iri: FOAF("Person") });

  it("should generate shape from resource schema", () => {
    const resource = ResourceObject({
      name: String({ property: FOAF("name"), required: true }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource);
    expect(shape.targetClass).toBe(FOAF("Person"));
    expect(shape.property.name).toBeDefined();
  });

  it("should require class in resource schema", () => {
    const resource = ResourceObject({
      name: String(),
    });

    expect(() => {
      fromResource(resource);
    }).toThrow("Cannot generate shape: resource schema must have a class");
  });

  it("should handle required properties", () => {
    const resource = ResourceObject({
      name: String({ property: FOAF("name"), required: true }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource, { strict: true });
    expect(shape.property.name.minCount).toBe(1);
  });

  it("should handle optional properties", () => {
    const resource = ResourceObject({
      email: String({ property: FOAF("mbox"), optional: true }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource, { strict: true });
    expect(shape.property.email.minCount).toBe(0);
  });

  it("should handle string constraints", () => {
    const resource = ResourceObject({
      name: String({
        property: FOAF("name"),
        minLength: 2,
        maxLength: 50,
        pattern: "^[A-Z]",
      }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource);
    expect(shape.property.name.minLength).toBe(2);
    expect(shape.property.name.maxLength).toBe(50);
    expect(shape.property.name.pattern).toBe("^[A-Z]");
  });

  it("should handle number constraints", () => {
    const resource = ResourceObject({
      age: Number({
        property: FOAF("age"),
        minimum: 0,
        maximum: 150,
        exclusiveMinimum: -1,
      }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource);
    expect(shape.property.age.minInclusive).toBe(0);
    expect(shape.property.age.maxInclusive).toBe(150);
    expect(shape.property.age.minExclusive).toBe(-1);
  });

  it("should handle Ref constraints", () => {
    const resource = ResourceObject({
      friend: Ref(Person, { property: FOAF("knows") }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource);
    expect(shape.property.friend.class).toBe(FOAF("Person"));
  });

  it("should support closed option", () => {
    const resource = ResourceObject({
      name: String({ property: FOAF("name") }),
    }, {
      class: Person,
    });

    const shape = fromResource(resource, { closed: true });
    expect(shape.closed).toBe(true);
  });

  it("should skip properties without IRI mapping", () => {
    const resource = ResourceObject({
      name: String({ property: FOAF("name") }),
      internalId: String(), // No property mapping
    }, {
      class: Person,
    });

    const shape = fromResource(resource);
    expect(shape.property.name).toBeDefined();
    expect(shape.property.internalId).toBeUndefined();
  });
});

