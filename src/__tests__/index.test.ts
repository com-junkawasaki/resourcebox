// DAG: test
// Main entry point coverage test

import { describe, expect, it } from "vitest";
import * as shapebox from "../index.ts";

describe("shapebox main entry point", () => {
  it("should export core types", () => {
    expect(shapebox.isIRI).toBeDefined();
    expect(shapebox.getIRIPrefix).toBeDefined();
    expect(shapebox.getIRILocalName).toBeDefined();
  });

  it("should export DSL functions", () => {
    expect(shapebox.iri).toBeDefined();
    expect(shapebox.classIri).toBeDefined();
    expect(shapebox.propertyIri).toBeDefined();
    expect(shapebox.datatypeIri).toBeDefined();
    expect(shapebox.cardinality).toBeDefined();
    expect(shapebox.exactlyOne).toBeDefined();
    expect(shapebox.optional).toBeDefined();
    expect(shapebox.oneOrMore).toBeDefined();
    expect(shapebox.zeroOrMore).toBeDefined();
    expect(shapebox.range).toBeDefined();
    expect(shapebox.defineShape).toBeDefined();
  });

  it("should export context functions", () => {
    expect(shapebox.buildContext).toBeDefined();
    expect(shapebox.mergeContexts).toBeDefined();
    expect(shapebox.extractNamespacePrefixes).toBeDefined();
  });

  it("should export validation functions", () => {
    expect(shapebox.validateStruct).toBeDefined();
    expect(shapebox.validateShape).toBeDefined();
    expect(shapebox.checkCardinality).toBeDefined();
    expect(shapebox.checkRange).toBeDefined();
    expect(shapebox.checkType).toBeDefined();
  });

  it("should export runtime validation helpers", () => {
    expect(shapebox.validateRangeExclusivityRuntime).toBeDefined();
    expect(shapebox.validateExtendsCircularRuntime).toBeDefined();
    expect(shapebox.validatePropsSchemaConsistencyRuntime).toBeDefined();
  });
});

