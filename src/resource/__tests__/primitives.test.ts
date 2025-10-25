// Resource primitives tests

import { describe, expect, it } from "vitest";
import { FOAF } from "../../onto/namespace.js";
import { ResourceBoolean, ResourceNumber, ResourceString } from "../primitives.js";

describe("Resource.String", () => {
  it("should create a string schema", () => {
    const schema = ResourceString();
    expect(schema.kind).toBe("String");
  });

  it("should accept options", () => {
    const schema = ResourceString({
      minLength: 1,
      maxLength: 100,
      format: "email",
    });

    expect(schema.options?.minLength).toBe(1);
    expect(schema.options?.maxLength).toBe(100);
    expect(schema.options?.format).toBe("email");
  });

  it("should support property reference", () => {
    const schema = ResourceString({
      property: FOAF("name"),
      required: true,
    });

    expect(schema.property).toBe(FOAF("name"));
    expect(schema.options?.required).toBe(true);
  });
});

describe("Resource.Number", () => {
  it("should create a number schema", () => {
    const schema = ResourceNumber();
    expect(schema.kind).toBe("Number");
  });

  it("should accept options", () => {
    const schema = ResourceNumber({
      minimum: 0,
      maximum: 150,
    });

    expect(schema.options?.minimum).toBe(0);
    expect(schema.options?.maximum).toBe(150);
  });
});

describe("Resource.Boolean", () => {
  it("should create a boolean schema", () => {
    const schema = ResourceBoolean();
    expect(schema.kind).toBe("Boolean");
  });
});
