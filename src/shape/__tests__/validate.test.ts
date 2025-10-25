// Shape.validate tests

import { describe, expect, it } from "vitest";
import { Class } from "../../onto/class.js";
import { FOAF } from "../../onto/namespace.js";
import { Define } from "../define.js";
import { Property } from "../property.js";
import type { ShapePropertyDef } from "../types.js";
import { check, validate } from "../validate.js";

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
    expect(result.violations?.[0].message).toContain("must be an object");
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

  it("should validate or constraint (one alternative satisfied)", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        v: Property({
          path: FOAF("value"),
          or: [
            Property({ path: FOAF("value"), minLength: 3 }),
            Property({ path: FOAF("value"), pattern: "^[A-Z]" }),
          ] as ShapePropertyDef[],
        }),
      },
    });

    expect(validate(shape, { v: "Ab" }).ok).toBe(true); // pattern ok
    expect(validate(shape, { v: "abc" }).ok).toBe(true); // minLength ok
    expect(validate(shape, { v: "a" }).ok).toBe(false);
  });

  it("should validate xone constraint (exactly one alternative)", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        v: Property({
          path: FOAF("value"),
          xone: [
            Property({ path: FOAF("value"), pattern: "^[A-Z]" }),
            Property({ path: FOAF("value"), minLength: 3 }),
          ] as ShapePropertyDef[],
        }),
      },
    });

    expect(validate(shape, { v: "Abc" }).ok).toBe(false); // both satisfied -> fail
    expect(validate(shape, { v: "abc" }).ok).toBe(true); // only minLength
    expect(validate(shape, { v: "A" }).ok).toBe(true); // only pattern
  });

  it("should validate nodeKind/in/hasValue constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        iriRef: Property({ path: FOAF("knows"), nodeKind: "IRI" }),
        email: Property({ path: FOAF("mbox"), nodeKind: "Literal", in: ["a@ex.org", "b@ex.org"] }),
        pinned: Property({ path: FOAF("pinned"), hasValue: true }),
      },
    });

    expect(validate(shape, { iriRef: "http://example.org/x" }).ok).toBe(true);
    expect(validate(shape, { iriRef: 123 }).ok).toBe(false);
    expect(validate(shape, { email: "a@ex.org" }).ok).toBe(true);
    expect(validate(shape, { email: "x@ex.org" }).ok).toBe(false);
    expect(validate(shape, { pinned: true }).ok).toBe(true);
    expect(validate(shape, { pinned: false }).ok).toBe(false);
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
