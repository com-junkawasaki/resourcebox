// Shape.validate tests

import { describe, expect, it } from "vitest";
import { Class } from "../../onto/class.js";
import { createInferenceContext } from "../../onto/inference.js";
import { FOAF, XSD } from "../../onto/namespace.js";
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

  it("should validate datatype constraints", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          datatype: XSD("string"),
        }),
        age: Property({
          path: FOAF("age"),
          datatype: XSD("integer"),
        }),
        active: Property({
          path: "http://example.org/active",
          datatype: XSD("boolean"),
        }),
      },
    });

    expect(validate(shape, { name: "John", age: 30, active: true }).ok).toBe(true);
    expect(validate(shape, { name: "John", age: "30", active: true }).ok).toBe(false); // age should be number
    expect(validate(shape, { name: "John", age: 30, active: "true" }).ok).toBe(false); // active should be boolean
  });

  it("should validate class constraints with inference context", () => {
    const Agent = Class({ iri: FOAF("Agent") });
    const Person = Class({ iri: FOAF("Person") });
    const Organization = Class({ iri: "http://example.org/Organization" });

    const context = createInferenceContext(
      [
        { iri: Person.iri, superClasses: [Agent.iri] },
        { iri: Agent.iri, superClasses: [] },
        { iri: Organization.iri, superClasses: [] },
      ],
      []
    );

    const shape = Define({
      targetClass: Person,
      property: {
        knows: Property({
          path: FOAF("knows"),
          class: Agent, // Should accept Person or Agent instances
        }),
        worksFor: Property({
          path: "http://example.org/worksFor",
          class: Organization, // Should only accept Organization instances
        }),
      },
    });

    const validData = {
      knows: { "@type": Person.iri, name: "Jane" },
      worksFor: { "@type": Organization.iri, name: "Acme Corp" },
    };

    const invalidData1 = {
      knows: { "@type": "http://example.org/Unknown", name: "Jane" }, // Wrong class
      worksFor: { "@type": Organization.iri, name: "Acme Corp" },
    };

    const invalidData2 = {
      knows: { "@type": Person.iri, name: "Jane" },
      worksFor: { "@type": Person.iri, name: "John" }, // Wrong class for worksFor
    };

    expect(validate(shape, validData, context).ok).toBe(true);
    expect(validate(shape, invalidData1, context).ok).toBe(false);
    expect(validate(shape, invalidData2, context).ok).toBe(false);
  });

  it("should work without inference context for backward compatibility", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        name: Property({
          path: FOAF("name"),
          datatype: XSD("string"),
        }),
      },
    });

    // Without context, datatype checking should still work
    expect(validate(shape, { name: "John" }).ok).toBe(true);
    expect(validate(shape, { name: 123 }).ok).toBe(false);
  });

  it("should validate and constraint (all alternatives satisfied)", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        value: Property({
          path: FOAF("value"),
          and: [
            Property({ path: FOAF("value"), minLength: 3 }),
            Property({ path: FOAF("value"), pattern: "^[A-Z]" }),
          ],
        }),
      },
    });

    expect(validate(shape, { value: "Abc" }).ok).toBe(true); // satisfies both
    expect(validate(shape, { value: "abc" }).ok).toBe(false); // missing pattern
    expect(validate(shape, { value: "AB" }).ok).toBe(false); // missing minLength
  });

  it("should validate not constraint (negation)", () => {
    const shape = Define({
      targetClass: Person,
      property: {
        value: Property({
          path: FOAF("value"),
          not: Property({ path: FOAF("value"), pattern: "^[A-Z]" }),
        }),
      },
    });

    expect(validate(shape, { value: "abc" }).ok).toBe(true); // does not match pattern
    expect(validate(shape, { value: "Abc" }).ok).toBe(false); // matches pattern (should not)
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
