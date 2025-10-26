// DAG: process-import-test
// RDF/XML importer tests

import { describe, expect, it } from "vitest";

import { expandContextMap } from "../../rpc/context-types.js";

import { importContextFromRdfXml } from "../rdfxml.js";

const SAMPLE_RDF_XML = `<?xml version="1.0"?>
<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  xmlns:ex="http://example.org/">
  <foaf:Person rdf:about="http://example.org/alice">
    <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Person" />
    <foaf:name>Alice</foaf:name>
    <foaf:mbox rdf:resource="mailto:alice@example.org" />
    <foaf:knows rdf:resource="http://example.org/bob" />
  </foaf:Person>
</rdf:RDF>`;

describe("importContextFromRdfXml", () => {
  it("extracts JSON-LD context from RDF/XML", async () => {
    const context = await importContextFromRdfXml(SAMPLE_RDF_XML, {
      namespaces: {
        foaf: "http://xmlns.com/foaf/0.1/",
        ex: "http://example.org/",
      },
    });

    const rpcMap = expandContextMap(context["@context"]);

    expect(rpcMap.foaf).toEqual({
      kind: "namespace",
      iri: "http://xmlns.com/foaf/0.1/",
    });

    expect(rpcMap.Person).toEqual({
      kind: "class",
      iri: "foaf:Person",
    });

    expect(rpcMap.name).toEqual({
      kind: "literal",
      iri: "foaf:name",
      datatype: "xsd:string",
      language: undefined,
    });

    expect(rpcMap.knows).toEqual({
      kind: "reference",
      iri: "foaf:knows",
    });
  });
});
