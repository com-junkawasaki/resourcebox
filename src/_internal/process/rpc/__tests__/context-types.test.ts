// DAG: process-rpc-test
// Tests for JSON-LD context expansion utilities

import { describe, expect, it } from "vitest";

import type { JsonLdContextMap } from "../../../../core/context/types.js";

import { expandContextMap, expandContextValue } from "../context-types.js";

describe("expandContextValue", () => {
  it("classifies namespace strings", () => {
    expect(expandContextValue("https://example.org/")).toEqual({
      kind: "namespace",
      iri: "https://example.org/",
    });
  });

  it("classifies class aliases", () => {
    expect(expandContextValue("ex:Person")).toEqual({
      kind: "class",
      iri: "ex:Person",
    });
  });

  it("classifies reference term definitions", () => {
    expect(
      expandContextValue({
        "@id": "ex:manager",
        "@type": "@id",
      })
    ).toEqual({
      kind: "reference",
      iri: "ex:manager",
    });
  });

  it("classifies literal term definitions", () => {
    expect(
      expandContextValue({
        "@id": "ex:email",
        "@type": "xsd:string",
      })
    ).toEqual({
      kind: "literal",
      iri: "ex:email",
      datatype: "xsd:string",
      language: undefined,
    });
  });
});

describe("expandContextMap", () => {
  it("expands all entries in the context map", () => {
    const context: JsonLdContextMap = {
      ex: "https://example.org/",
      Person: "ex:Person",
      manager: {
        "@id": "ex:manager",
        "@type": "@id",
      },
      email: {
        "@id": "ex:email",
        "@type": "xsd:string",
      },
    };

    expect(expandContextMap(context)).toEqual({
      ex: { kind: "namespace", iri: "https://example.org/" },
      Person: { kind: "class", iri: "ex:Person" },
      manager: { kind: "reference", iri: "ex:manager" },
      email: {
        kind: "literal",
        iri: "ex:email",
        datatype: "xsd:string",
        language: undefined,
      },
    });
  });
});

