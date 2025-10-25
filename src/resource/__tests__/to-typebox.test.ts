// Resource.toTypeBox tests

import { describe, expect, it } from "vitest";
import { Array as ResourceArray } from "../array.js";
import { Literal } from "../literal.js";
import { Object as ResourceObject } from "../object.js";
import { Optional } from "../optional.js";
import { Boolean as RBBool, Number as RBNumber, String as RBString } from "../primitives.js";
import { Ref } from "../ref.js";
import { toTypeBox } from "../to-typebox.js";

describe("Resource.toTypeBox", () => {
  it("should convert String schema", () => {
    const schema = RBString({ minLength: 5, format: "email" });
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("string");
  });

  it("should convert Number schema", () => {
    const schema = RBNumber({ minimum: 0, maximum: 100 });
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("number");
  });

  it("should convert Boolean schema", () => {
    const schema = RBBool();
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("boolean");
  });

  it("should convert Array schema", () => {
    const schema = ResourceArray(RBString());
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("array");
  });

  it("should convert Object schema", () => {
    const schema = ResourceObject({
      name: RBString(),
      age: RBNumber({ optional: true }),
    });
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("object");
  });

  it("should convert Ref schema", () => {
    const schema = Ref("http://example.org/Person");
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.type).toBe("string");
    expect(typebox.format).toBe("uri");
  });

  it("should convert Literal schema with primitive", () => {
    const schema = Literal("test");
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.const).toBe("test");
  });

  it("should convert Literal schema with array", () => {
    const schema = Literal(["a", "b", "c"]);
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.const).toEqual(["a", "b", "c"]);
  });

  it("should convert Optional schema", () => {
    const schema = Optional(RBString());
    const typebox = toTypeBox(schema);

    expect(typebox).toBeDefined();
    expect(typebox.anyOf).toBeDefined();
  });
});
