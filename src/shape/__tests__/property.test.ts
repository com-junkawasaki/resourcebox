// Shape.Property tests

import { describe, expect, it } from "vitest";
import { Property } from "../property.js";
import { FOAF } from "../../onto/namespace.js";

describe("Shape.Property", () => {
  it("should create a property definition with required path", () => {
    const prop = Property({
      path: FOAF("name"),
    });

    expect(prop.path).toBe(FOAF("name"));
  });

  it("should support datatype constraint", () => {
    const prop = Property({
      path: FOAF("name"),
      datatype: "xsd:string",
    });

    expect(prop.datatype).toBe("xsd:string");
  });

  it("should support class constraint", () => {
    const prop = Property({
      path: FOAF("knows"),
      class: FOAF("Person"),
    });

    expect(prop.class).toBe(FOAF("Person"));
  });

  it("should support cardinality constraints", () => {
    const prop = Property({
      path: FOAF("name"),
      minCount: 1,
      maxCount: 1,
    });

    expect(prop.minCount).toBe(1);
    expect(prop.maxCount).toBe(1);
  });

  it("should support string constraints", () => {
    const prop = Property({
      path: FOAF("email"),
      minLength: 5,
      maxLength: 100,
      pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    });

    expect(prop.minLength).toBe(5);
    expect(prop.maxLength).toBe(100);
    expect(prop.pattern).toBe("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
  });

  it("should support numeric constraints", () => {
    const prop = Property({
      path: FOAF("age"),
      minInclusive: 0,
      maxInclusive: 150,
    });

    expect(prop.minInclusive).toBe(0);
    expect(prop.maxInclusive).toBe(150);
  });

  it("should support exclusive numeric constraints", () => {
    const prop = Property({
      path: FOAF("temperature"),
      minExclusive: -273.15,
      maxExclusive: 100,
    });

    expect(prop.minExclusive).toBe(-273.15);
    expect(prop.maxExclusive).toBe(100);
  });

  it("should support description", () => {
    const prop = Property({
      path: FOAF("name"),
      description: "The name of the person",
    });

    expect(prop.description).toBe("The name of the person");
  });

  it("should handle optional parameters", () => {
    const prop = Property({
      path: FOAF("name"),
    });

    expect(prop.datatype).toBeUndefined();
    expect(prop.class).toBeUndefined();
    expect(prop.minCount).toBeUndefined();
    expect(prop.maxCount).toBeUndefined();
    expect(prop.minLength).toBeUndefined();
    expect(prop.maxLength).toBeUndefined();
    expect(prop.pattern).toBeUndefined();
    expect(prop.minInclusive).toBeUndefined();
    expect(prop.maxInclusive).toBeUndefined();
    expect(prop.minExclusive).toBeUndefined();
    expect(prop.maxExclusive).toBeUndefined();
    expect(prop.description).toBeUndefined();
  });
});
