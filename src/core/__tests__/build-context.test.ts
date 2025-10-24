// DAG: core-test
// buildContext tests

import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { buildContext, extractNamespacePrefixes, mergeContexts } from "../context/build-context.js";
import { cardinality } from "../dsl/cardinality.js";
import { defineShape } from "../dsl/define-shape.js";
import { iri } from "../dsl/iri.js";
import { range } from "../dsl/range.js";

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

  it("should handle URN and full URIs", () => {
    const Shape = defineShape({
      classIri: iri("urn:example:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        url: Type.String(),
        simple: Type.String(),
      }),
      props: {
        url: {
          predicate: iri("https://schema.org/url"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("http://www.w3.org/2001/XMLSchema#anyURI")),
        },
        simple: {
          predicate: iri("simpleProp"),
          cardinality: cardinality({ min: 0, max: 1, required: false }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });

    const prefixes = extractNamespacePrefixes([Shape]);

    // URNs and full URIs should not appear as prefixes
    expect(prefixes.has("urn")).toBe(false);
    expect(prefixes.has("https")).toBe(false);
    expect(prefixes.has("http")).toBe(false);
    // But xsd should appear
    expect(prefixes.has("xsd")).toBe(true);
  });
});

describe("buildContext edge cases", () => {
  it("should skip @id, @type, @context properties", () => {
    const Shape = defineShape({
      classIri: iri("ex:Shape"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        "@context": Type.Optional(Type.Object({})),
        name: Type.String(),
      }),
      props: {
        "@id": {
          predicate: iri("ex:id"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        "@type": {
          predicate: iri("ex:type"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        "@context": {
          predicate: iri("ex:context"),
          cardinality: cardinality({ min: 0, max: 1, required: false }),
          range: range.datatype(iri("xsd:string")),
        },
        name: {
          predicate: iri("ex:hasName"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });

    const context = buildContext([Shape]);

    // Should not include @id, @type, @context as property terms
    expect(context["@context"]["@id"]).toBeUndefined();
    expect(context["@context"]["@type"]).toBeUndefined();
    expect(context["@context"]["@context"]).toBeUndefined();
    // But should include regular properties
    expect(context["@context"]["name"]).toBeDefined();
  });

  it("should handle undefined propertyMeta", () => {
    const Shape = defineShape({
      classIri: iri("ex:Shape"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
      }),
      props: {},
    });

    const context = buildContext([Shape]);
    expect(context["@context"]["Shape"]).toBe("ex:Shape");
  });

  it("should handle includeProperties option", () => {
    const Shape = defineShape({
      classIri: iri("ex:Shape"),
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

    const contextWithProps = buildContext([Shape], { includeProperties: true });
    expect(contextWithProps["@context"]["name"]).toBeDefined();

    const contextWithoutProps = buildContext([Shape], { includeProperties: false });
    expect(contextWithoutProps["@context"]["name"]).toBeUndefined();
  });
});
