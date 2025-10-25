// Resource.Array tests

import { describe, expect, it } from "vitest";
import { FOAF } from "../../onto/namespace.js";
import { ResourceArray } from "../array.js";
import { String as RBString } from "../primitives.js";

describe("Resource.Array", () => {
  it("should create an array schema", () => {
    const schema = ResourceArray(RBString());
    expect(schema.kind).toBe("Array");
    expect(schema.items.kind).toBe("String");
  });

  it("should accept options", () => {
    const schema = ResourceArray(RBString(), {
      minItems: 1,
      maxItems: 10,
      uniqueItems: true,
    });

    expect(schema.options?.minItems).toBe(1);
    expect(schema.options?.maxItems).toBe(10);
    expect(schema.options?.uniqueItems).toBe(true);
  });

  it("should support property reference", () => {
    const schema = ResourceArray(RBString(), {
      property: FOAF("interests"),
    });

    expect(schema.property).toBe(FOAF("interests"));
  });

  it("should support required/optional", () => {
    const required = ResourceArray(RBString(), { required: true });
    const optional = ResourceArray(RBString(), { optional: true });

    expect(required.options?.required).toBe(true);
    expect(optional.options?.optional).toBe(true);
  });
});
