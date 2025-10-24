// DAG: core-test
// Type-level checks runtime validation tests

import { describe, expect, it } from "vitest";
import { iri } from "../dsl/iri.js";
import { range } from "../dsl/range.js";
import {
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
  validateRangeExclusivityRuntime,
} from "../typecheck/index.js";

describe("validateRangeExclusivityRuntime", () => {
  it("should validate datatype range", () => {
    const datatypeRange = range.datatype(iri("xsd:string"));
    const error = validateRangeExclusivityRuntime(datatypeRange);
    expect(error).toBeUndefined();
  });

  it("should validate shape range", () => {
    const shapeRange = range.shape("ex:Person");
    const error = validateRangeExclusivityRuntime(shapeRange);
    expect(error).toBeUndefined();
  });

  it("should detect invalid range with wrong kind", () => {
    const invalidRange = { kind: "invalid" } as unknown as {
      kind: "datatype";
      datatype: string;
    };
    const error = validateRangeExclusivityRuntime(invalidRange);
    expect(error).toContain("invalid kind");
  });

  it("should detect datatype range missing datatype field", () => {
    const invalidRange = { kind: "datatype" } as unknown as {
      kind: "datatype";
      datatype: string;
    };
    const error = validateRangeExclusivityRuntime(invalidRange);
    expect(error).toContain("missing datatype field");
  });

  it("should detect shape range missing shapeId field", () => {
    const invalidRange = { kind: "shape" } as unknown as { kind: "shape"; shapeId: string };
    const error = validateRangeExclusivityRuntime(invalidRange);
    expect(error).toContain("missing shapeId field");
  });

  it("should detect datatype range with shapeId field", () => {
    const invalidRange = {
      kind: "datatype",
      datatype: "xsd:string",
      shapeId: "ex:Person",
    } as unknown as { kind: "datatype"; datatype: string };
    const error = validateRangeExclusivityRuntime(invalidRange);
    expect(error).toContain("also has shapeId field");
  });

  it("should detect shape range with datatype field", () => {
    const invalidRange = {
      kind: "shape",
      shapeId: "ex:Person",
      datatype: "xsd:string",
    } as unknown as { kind: "shape"; shapeId: string };
    const error = validateRangeExclusivityRuntime(invalidRange);
    expect(error).toContain("also has datatype field");
  });
});

describe("validateExtendsCircularRuntime", () => {
  it("should allow non-circular extends", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), [iri("ex:Agent")]);
    expect(error).toBeUndefined();
  });

  it("should allow multiple non-circular extends", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), [
      iri("ex:Agent"),
      iri("ex:Thing"),
    ]);
    expect(error).toBeUndefined();
  });

  it("should allow empty extends", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), []);
    expect(error).toBeUndefined();
  });

  it("should allow undefined extends", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), undefined);
    expect(error).toBeUndefined();
  });

  it("should detect self-reference", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), [iri("ex:Person")]);
    expect(error).toContain("circular");
    expect(error).toContain("ex:Person");
  });

  it("should detect self-reference in multiple extends", () => {
    const error = validateExtendsCircularRuntime(iri("ex:Person"), [
      iri("ex:Agent"),
      iri("ex:Person"),
    ]);
    expect(error).toContain("circular");
    expect(error).toContain("ex:Person");
  });
});

describe("validatePropsSchemaConsistencyRuntime", () => {
  it("should allow matching keys", () => {
    const error = validatePropsSchemaConsistencyRuntime(["email", "name"], ["email", "name"]);
    expect(error).toBeUndefined();
  });

  it("should allow props subset of schema", () => {
    const error = validatePropsSchemaConsistencyRuntime(
      ["email", "name", "age"],
      ["email", "name"]
    );
    expect(error).toBeUndefined();
  });

  it("should allow empty props", () => {
    const error = validatePropsSchemaConsistencyRuntime(["email", "name"], []);
    expect(error).toBeUndefined();
  });

  it("should detect props keys not in schema", () => {
    const error = validatePropsSchemaConsistencyRuntime(["email"], ["email", "age"]);
    expect(error).toContain("do not exist in schema");
    expect(error).toContain("age");
  });

  it("should detect multiple props keys not in schema", () => {
    const error = validatePropsSchemaConsistencyRuntime(["email"], ["email", "age", "phone"]);
    expect(error).toContain("do not exist in schema");
    expect(error).toContain("age");
    expect(error).toContain("phone");
  });
});
