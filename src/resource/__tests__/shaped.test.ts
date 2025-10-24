// Resource.Shaped tests

import { describe, expect, it } from "vitest";
import { Shaped } from "../shaped.js";
import { String } from "../primitives.js";
import { FOAF } from "../../onto/namespace.js";

describe("Resource.Shaped", () => {
  it("should create a shaped resource", () => {
    const shaped = Shaped({
      class: FOAF("Person"),
      properties: {
        name: String({ required: true }),
      },
    });

    expect(shaped.resource.kind).toBe("Object");
    expect(shaped.resource.options?.class).toBe(FOAF("Person"));
    expect(shaped.resource.properties.name.kind).toBe("String");
  });

  it("should support complex properties", () => {
    const shaped = Shaped({
      class: FOAF("Person"),
      properties: {
        name: String({ property: FOAF("name"), required: true }),
        age: String({ property: FOAF("age"), optional: true }),
      },
    });

    expect(shaped.resource.properties.name.property).toBe(FOAF("name"));
    expect(shaped.resource.properties.age.property).toBe(FOAF("age"));
  });

  it("should support shape options", () => {
    const shaped = Shaped({
      class: FOAF("Person"),
      properties: {
        name: String(),
      },
      shape: {
        closed: true,
      },
    });

    expect(shaped.resource.kind).toBe("Object");
    expect(shaped.shape).toBeUndefined(); // TODO: Shape generation not implemented yet
  });

  it("should support empty shape options", () => {
    const shaped = Shaped({
      class: FOAF("Person"),
      properties: {
        name: String(),
      },
      shape: {},
    });

    expect(shaped.resource.kind).toBe("Object");
    expect(shaped.shape).toBeUndefined();
  });
});

