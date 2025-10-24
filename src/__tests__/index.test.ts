// DAG: test
// Main entry point coverage test

import { describe, expect, it } from "vitest";
import * as resourcebox from "../index.js";

describe("resourcebox main entry point", () => {
  it("should export core types", () => {
    expect(resourcebox.isIRI).toBeDefined();
    expect(resourcebox.getIRIPrefix).toBeDefined();
    expect(resourcebox.getIRILocalName).toBeDefined();
  });

  it("should export DSL functions", () => {
    expect(resourcebox.iri).toBeDefined();
    expect(resourcebox.classIri).toBeDefined();
    expect(resourcebox.propertyIri).toBeDefined();
    expect(resourcebox.datatypeIri).toBeDefined();
    expect(resourcebox.cardinality).toBeDefined();
    expect(resourcebox.exactlyOne).toBeDefined();
    expect(resourcebox.optional).toBeDefined();
    expect(resourcebox.oneOrMore).toBeDefined();
    expect(resourcebox.zeroOrMore).toBeDefined();
    expect(resourcebox.range).toBeDefined();
    expect(resourcebox.defineShape).toBeDefined();
  });

  it("should export context functions", () => {
    expect(resourcebox.buildContext).toBeDefined();
    expect(resourcebox.mergeContexts).toBeDefined();
    expect(resourcebox.extractNamespacePrefixes).toBeDefined();
  });

  it("should export validation functions", () => {
    expect(resourcebox.validateStruct).toBeDefined();
    expect(resourcebox.validateShape).toBeDefined();
    expect(resourcebox.checkCardinality).toBeDefined();
    expect(resourcebox.checkRange).toBeDefined();
    expect(resourcebox.checkType).toBeDefined();
  });

  it("should export runtime validation helpers", () => {
    expect(resourcebox.validateRangeExclusivityRuntime).toBeDefined();
    expect(resourcebox.validateExtendsCircularRuntime).toBeDefined();
    expect(resourcebox.validatePropsSchemaConsistencyRuntime).toBeDefined();
  });
});
