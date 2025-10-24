// DAG: core-test
// buildContext tests

import { describe, it, expect } from "vitest";
import { Type } from "@sinclair/typebox";
import { defineShape } from "../dsl/define-shape.ts";
import { iri } from "../dsl/iri.ts";
import { cardinality } from "../dsl/cardinality.ts";
import { range } from "../dsl/range.ts";
import {
  buildContext,
  mergeContexts,
  extractNamespacePrefixes,
} from "../context/build-context.ts";

describe("buildContext", () => {
  it("should build context from single shape", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String({ format: "uri" }),
        "@type": Type.Array(Type.String({ format: "uri" })),
        email: Type.String({ format: "email" }),
      }),
      props: {
        email: {
          predicate: iri("ex:hasEmail"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });
    
    const context = buildContext([Person]);
    
    expect(context["@context"]["Person"]).toBe("ex:Person");
    expect(context["@context"]["email"]).toEqual({
      "@id": "ex:hasEmail",
      "@type": "xsd:string",
    });
  });
  
  it("should build context with shape reference", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String({ format: "uri" }),
        "@type": Type.Array(Type.String({ format: "uri" })),
        name: Type.String(),
        manager: Type.Optional(Type.String({ format: "uri" })),
      }),
      props: {
        name: {
          predicate: iri("ex:hasName"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        manager: {
          predicate: iri("ex:hasManager"),
          cardinality: cardinality({ min: 0, max: 1, required: false }),
          range: range.shape("ex:Person"),
        },
      },
    });
    
    const context = buildContext([Person]);
    
    expect(context["@context"]["manager"]).toEqual({
      "@id": "ex:hasManager",
      "@type": "@id", // IRI reference
    });
  });
  
  it("should build context from multiple shapes", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        name: Type.String(),
      }),
      props: {
        name: {
          predicate: iri("ex:hasName"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });
    
    const Project = defineShape({
      classIri: iri("ex:Project"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        title: Type.String(),
      }),
      props: {
        title: {
          predicate: iri("ex:hasTitle"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });
    
    const context = buildContext([Person, Project]);
    
    expect(context["@context"]["Person"]).toBe("ex:Person");
    expect(context["@context"]["Project"]).toBe("ex:Project");
    expect(context["@context"]["name"]).toBeDefined();
    expect(context["@context"]["title"]).toBeDefined();
  });
  
  it("should include namespaces if requested", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
      }),
      props: {},
    });
    
    const context = buildContext([Person], {
      includeNamespaces: true,
      namespaces: {
        ex: "http://example.org/",
        xsd: "http://www.w3.org/2001/XMLSchema#",
      },
    });
    
    expect(context["@context"]["ex"]).toBe("http://example.org/");
    expect(context["@context"]["xsd"]).toBe("http://www.w3.org/2001/XMLSchema#");
  });
});

describe("mergeContexts", () => {
  it("should merge multiple contexts", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
      }),
      props: {},
    });
    
    const Project = defineShape({
      classIri: iri("ex:Project"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
      }),
      props: {},
    });
    
    const context1 = buildContext([Person]);
    const context2 = buildContext([Project]);
    const merged = mergeContexts([context1, context2]);
    
    expect(merged["@context"]["Person"]).toBe("ex:Person");
    expect(merged["@context"]["Project"]).toBe("ex:Project");
  });
});

describe("extractNamespacePrefixes", () => {
  it("should extract unique prefixes", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        name: Type.String(),
      }),
      props: {
        name: {
          predicate: iri("foaf:name"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
      extends: [iri("foaf:Agent")],
    });
    
    const prefixes = extractNamespacePrefixes([Person]);
    
    expect(prefixes.has("ex")).toBe(true);
    expect(prefixes.has("foaf")).toBe(true);
    expect(prefixes.has("xsd")).toBe(true);
  });
});

