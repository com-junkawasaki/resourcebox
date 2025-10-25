// Resource.context tests

import { describe, expect, it } from "vitest";
import { Class } from "../../onto/class.js";
import { FOAF } from "../../onto/namespace.js";
import { ResourceArray } from "../array.js";
import { context, extractNamespaces } from "../context.js";
import { Object as ResourceObject } from "../object.js";
import { String as RBString } from "../primitives.js";
import { Ref } from "../ref.js";

describe("Resource.context", () => {
  const Person = Class({ iri: FOAF("Person") });

  it("should generate context from object schema", () => {
    const schema = ResourceObject(
      {
        name: RBString({ property: FOAF("name") }),
        email: RBString({ property: FOAF("mbox") }),
      },
      {
        class: Person,
      }
    );

    const result = context(schema);
    expect(result["@context"]).toBeDefined();
    expect(result["@context"].name).toEqual({ "@id": FOAF("name") });
    expect(result["@context"].email).toEqual({ "@id": FOAF("mbox") });
  });

  it("should include namespaces when requested", () => {
    const schema = ResourceObject({
      name: RBString({ property: FOAF("name") }),
    });

    const result = context(schema, {
      includeNamespaces: true,
      namespaces: { foaf: "http://xmlns.com/foaf/0.1/" },
    });

    expect(result["@context"].foaf).toBe("http://xmlns.com/foaf/0.1/");
    expect(result["@context"].name).toEqual({ "@id": FOAF("name") });
  });

  it("should handle array properties", () => {
    const schema = ResourceObject({
      friends: ResourceArray(Ref(Person), { property: FOAF("knows") }),
    });

    const result = context(schema);
    expect(result["@context"].friends).toEqual({
      "@id": FOAF("knows"),
      "@type": "@id",
    });
  });

  it("should handle simple array properties", () => {
    const schema = ResourceObject({
      tags: ResourceArray(RBString(), { property: FOAF("topic_interest") }),
    });

    const result = context(schema);
    expect(result["@context"].tags).toEqual({ "@id": FOAF("topic_interest") });
  });

  it("should skip properties without IRI mapping", () => {
    const schema = ResourceObject({
      name: RBString({ property: FOAF("name") }),
      internalId: RBString(), // No property mapping
    });

    const result = context(schema);
    expect(result["@context"].name).toBeDefined();
    expect(result["@context"].internalId).toBeUndefined();
  });

  it("should skip JSON-LD reserved properties", () => {
    const schema = ResourceObject({
      "@id": RBString(),
      "@type": RBString(),
      "@context": RBString(),
      name: RBString({ property: FOAF("name") }),
    });

    const result = context(schema);
    expect(result["@context"]["@id"]).toBeUndefined();
    expect(result["@context"]["@type"]).toBeUndefined();
    expect(result["@context"]["@context"]).toBeUndefined();
    expect(result["@context"].name).toBeDefined();
  });
});

describe("Resource.extractNamespaces", () => {
  it("should extract namespaces from properties", () => {
    const schema = ResourceObject({
      name: RBString({ property: "foaf:name" }),
      knows: Ref("foaf:Person"),
    });

    const namespaces = extractNamespaces(schema);
    expect(namespaces.has("foaf")).toBe(true);
  });

  it("should extract namespaces from class", () => {
    const schema = ResourceObject(
      {
        name: RBString(),
      },
      {
        class: "foaf:Person",
      }
    );

    const namespaces = extractNamespaces(schema);
    expect(namespaces.has("foaf")).toBe(true);
  });

  it("should return empty set for schema without namespaces", () => {
    const schema = ResourceObject({
      name: RBString(),
    });

    const namespaces = extractNamespaces(schema);
    expect(namespaces.size).toBe(0);
  });

  it("should handle prefixed IRIs", () => {
    const schema = ResourceObject({
      name: RBString({ property: "foaf:name" }),
    });

    const namespaces = extractNamespaces(schema);
    expect(namespaces.has("foaf")).toBe(true);
  });

  it("should not extract from full URIs", () => {
    const schema = ResourceObject({
      name: RBString({ property: "http://xmlns.com/foaf/0.1/name" }),
    });

    const namespaces = extractNamespaces(schema);
    expect(namespaces.has("foaf")).toBe(false);
  });
});
