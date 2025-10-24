// Shape.validate tests

import { describe, expect, it } from "vitest";
import { validate, check } from "../validate.js";
import { Define } from "../define.js";
import { Property } from "../property.js";
import { FOAF } from "../../onto/namespace.js";
import { Class } from "../../onto/class.js";

describe("Shape.validate", () => {
  const Person = Class({ iri: FOAF("Person") });

  it("should validate data with no property constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    const data = {
      "@id": "http://example.org/person1",
      "@type": [FOAF("Person")],
      name: "John Doe",
    };

    const result = validate(shape, data);
    expect(result.ok).toBe(true);
  });

  it("should validate @type constraint", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    const validData = {
      "@type": [FOAF("Person")],
      name: "John",
    };

    const invalidData = {
      "@type": ["http://example.org/Organization"],
      name: "John",
    };

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData).ok).toBe(false);
  });

  it("should validate minCount constraint", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          minCount: 1,
        }),
      },
    });

    const validData = { name: "John" };
    const invalidData = {}; // Missing required property

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData).ok).toBe(false);
  });

  it("should validate maxCount constraint", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          maxCount: 1,
        }),
      },
    });

    const validData = { name: "John" };
    const invalidData = { name: ["John", "Jane"] }; // Too many values

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData).ok).toBe(false);
  });

  it("should validate string constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          minLength: 2,
          maxLength: 50,
          pattern: "^[A-Z]",
        }),
      },
    });

    const validData = { name: "John" };
    const invalidData1 = { name: "J" }; // Too short
    const invalidData2 = { name: "jane" }; // Doesn't match pattern

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData1).ok).toBe(false);
    expect(validate(shape, invalidData2).ok).toBe(false);
  });

  it("should validate numeric constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        age: Property({
          path: FOAF("age"),
          minInclusive: 0,
          maxInclusive: 150,
        }),
      },
    });

    const validData = { age: 25 };
    const invalidData1 = { age: -5 }; // Too small
    const invalidData2 = { age: 200 }; // Too large

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData1).ok).toBe(false);
    expect(validate(shape, invalidData2).ok).toBe(false);
  });

  it("should validate exclusive numeric constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        temperature: Property({
          path: "ex:temperature",
          minExclusive: -273.15,
          maxExclusive: 100,
        }),
      },
    });

    const validData = { temperature: 25 };
    const invalidData1 = { temperature: -273.15 }; // Equal to minExclusive
    const invalidData2 = { temperature: 100 }; // Equal to maxExclusive

    expect(validate(shape, validData).ok).toBe(true);
    expect(validate(shape, invalidData1).ok).toBe(false);
    expect(validate(shape, invalidData2).ok).toBe(false);
  });

  it("should handle non-object data", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    const result = validate(shape, "not an object");
    expect(result.ok).toBe(false);
    expect(result.violations).toBeDefined();
    expect(result.violations![0].message).toContain("must be an object");
  });

  it("should handle validation errors gracefully", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    const result = validate(shape, null);
    expect(result.ok).toBe(false);
    expect(result.violations).toBeDefined();
  });
});

describe("Shape.check", () => {
  const Person = Class({ iri: FOAF("Person") });

  it("should return true for valid data", () => {
    const shape = Define({
      targetClass: Person,
      property: {},
    });

    const data = { name: "John" };
    expect(check(shape, data)).toBe(true);
  });

  it("should return false for invalid data", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          minLength: 10,
        }),
      },
    });

    const data = { name: "John" }; // Too short
    expect(check(shape, data)).toBe(false);
  });
});

