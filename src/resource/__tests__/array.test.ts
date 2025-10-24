// Resource.Array tests

import { describe, expect, it } from "vitest";
import { Array as ResourceArray } from "../array.js";
import { String } from "../primitives.js";
import { FOAF } from "../../onto/namespace.js";

describe("Resource.Array", () => {
  it("should create an array schema", () => {
    const schema = ResourceArray(String());
    expect(schema.kind).toBe("Array");
    expect(schema.items.kind).toBe("String");
  });

  it("should accept options", () => {
    const schema = ResourceArray(String(), {
      minItems: 1,
      maxItems: 10,
      uniqueItems: true,
    });

    expect(schema.options?.minItems).toBe(1);
    expect(schema.options?.maxItems).toBe(10);
    expect(schema.options?.uniqueItems).toBe(true);
  });

  it("should support property reference", () => {
    const schema = ResourceArray(String(), {
      property: FOAF("interests"),
    });

    expect(schema.property).toBe(FOAF("interests"));
  });

  it("should support required/optional", () => {
    const required = ResourceArray(String(), { required: true });
    const optional = ResourceArray(String(), { optional: true });

    expect(required.options?.required).toBe(true);
    expect(optional.options?.optional).toBe(true);
  });
});

