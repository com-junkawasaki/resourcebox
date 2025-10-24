// Resource.Optional tests

import { describe, expect, it } from "vitest";
import { Optional, isOptional, isRequired } from "../optional.js";
import { String, Number } from "../primitives.js";

describe("Resource.Optional", () => {
  it("should create an optional schema", () => {
    const schema = Optional(String());
    expect(schema.kind).toBe("Optional");
    expect(schema.schema.kind).toBe("String");
  });

  it("should wrap different schema types", () => {
    const stringSchema = Optional(String({ minLength: 5 }));
    const numberSchema = Optional(Number({ minimum: 0 }));

    expect(stringSchema.kind).toBe("Optional");
    expect(stringSchema.schema.kind).toBe("String");
    expect(numberSchema.kind).toBe("Optional");
    expect(numberSchema.schema.kind).toBe("Number");
  });

  describe("isOptional", () => {
    it("should return true for Optional schema", () => {
      const schema = Optional(String());
      expect(isOptional(schema)).toBe(true);
    });

    it("should return true for schema with optional: true", () => {
      const schema = String({ optional: true });
      expect(isOptional(schema)).toBe(true);
    });

    it("should return false for required schema", () => {
      const schema = String({ required: true });
      expect(isOptional(schema)).toBe(false);
    });
  });

  describe("isRequired", () => {
    it("should return false for Optional schema", () => {
      const schema = Optional(String());
      expect(isRequired(schema)).toBe(false);
    });

    it("should return true for schema with required: true", () => {
      const schema = String({ required: true });
      expect(isRequired(schema)).toBe(true);
    });

    it("should return true for schema without explicit required/optional", () => {
      const schema = String();
      expect(isRequired(schema)).toBe(true);
    });

    it("should return false for schema with optional: true", () => {
      const schema = String({ optional: true });
      expect(isRequired(schema)).toBe(false);
    });
  });
});

