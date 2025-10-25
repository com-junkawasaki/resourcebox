// Resource.validate tests

import { describe, expect, it } from "vitest";
import { Object as ResourceObject } from "../object.js";
import { Number as RBNumber, String as RBString } from "../primitives.js";
import { check, parse, validate } from "../validate.js";

describe("Resource.validate", () => {
  it("should validate valid data", () => {
    const schema = RBString({ minLength: 3 });
    const result = validate(schema, "hello");

    expect(result.ok).toBe(true);
    expect(result.data).toBe("hello");
    expect(result.errors).toBeUndefined();
  });

  it("should return errors for invalid data", () => {
    const schema = RBString({ minLength: 5 });
    const result = validate(schema, "hi");

    expect(result.ok).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should validate object schemas", () => {
    const schema = ResourceObject({
      name: RBString({ minLength: 1 }),
      age: RBNumber({ minimum: 0 }),
    });

    const validData = { name: "John", age: 30 };
    const result = validate(schema, validData);

    expect(result.ok).toBe(true);
    expect(result.data).toBe(validData);
  });

  it("should handle validation errors gracefully", () => {
    const schema = RBString();
    const result = validate(schema, null);

    expect(result.ok).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe("Resource.check", () => {
  it("should return true for valid data", () => {
    const schema = RBString({ minLength: 3 });
    expect(check(schema, "hello")).toBe(true);
  });

  it("should return false for invalid data", () => {
    const schema = RBString({ minLength: 5 });
    expect(check(schema, "hi")).toBe(false);
  });
});

describe("Resource.parse", () => {
  it("should return data for valid input", () => {
    const schema = RBString({ minLength: 3 });
    expect(parse(schema, "hello")).toBe("hello");
  });

  it("should throw for invalid input", () => {
    const schema = RBString({ minLength: 5 });

    expect(() => {
      parse(schema, "hi");
    }).toThrow("Validation failed");
  });
});
