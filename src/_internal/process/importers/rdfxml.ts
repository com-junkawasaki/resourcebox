// DAG: process-import
// RDF/XML ingestion and JSON-LD context extraction utilities

import { Readable } from "node:stream";

import type { Quad } from "@rdfjs/types";
import { RdfXmlParser } from "rdfxml-streaming-parser";

import type { JsonLdContext } from "../../../core/context/types.js";

const RDF_TYPE_IRI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export interface RdfXmlImportOptions {
  readonly baseIRI?: string;
  readonly namespaces?: Record<string, string>;
  readonly includeClasses?: boolean;
}

export async function importContextFromRdfXml(
  rdfXml: string,
  options: RdfXmlImportOptions = {}
): Promise<JsonLdContext> {
  const quads = await parseRdfXmlToQuads(Readable.from([rdfXml]), options.baseIRI);
  return buildContextFromQuads(quads, options);
}

export async function importContextFromStream(
  stream: Readable,
  options: RdfXmlImportOptions = {}
): Promise<JsonLdContext> {
  const quads = await parseRdfXmlToQuads(stream, options.baseIRI);
  return buildContextFromQuads(quads, options);
}

function buildContextFromQuads(
  quads: ReadonlyArray<Quad>,
  options: RdfXmlImportOptions
): JsonLdContext {
  const { namespaces = {}, includeClasses = true } = options;

  const contextMap: Record<string, any> = {};

  for (const [prefix, iri] of Object.entries(namespaces)) {
    contextMap[prefix] = iri;
  }

  for (const quad of quads) {
    if (quad.predicate.value === RDF_TYPE_IRI) {
      if (includeClasses && quad.object.termType === "NamedNode") {
        const term = getLocalName(quad.object.value);
        if (term && !contextMap[term]) {
          contextMap[term] = compactIri(quad.object.value, namespaces);
        }
      }
      continue;
    }

    const term = getLocalName(quad.predicate.value);
    if (!term || isReservedTerm(term)) {
      continue;
    }

    if (contextMap[term]) {
      continue;
    }

    if (quad.object.termType === "NamedNode") {
      contextMap[term] = {
        "@id": compactIri(quad.predicate.value, namespaces),
        "@type": "@id",
      };
    } else if (quad.object.termType === "Literal") {
      const datatype = quad.object.datatype?.value;
      contextMap[term] = datatype
        ? {
            "@id": compactIri(quad.predicate.value, namespaces),
            "@type": compactIri(datatype, namespaces),
          }
        : {
            "@id": compactIri(quad.predicate.value, namespaces),
          };
    }
  }

  return { "@context": contextMap };
}

async function parseRdfXmlToQuads(stream: Readable, baseIRI?: string): Promise<Quad[]> {
  const parser = new RdfXmlParser({ baseIRI: baseIRI || "http://example.org/" });

  return new Promise((resolve, reject) => {
    const quads: Quad[] = [];

    parser.on("data", (quad) => {
      quads.push(quad);
    });

    parser.on("error", reject);
    parser.on("end", () => resolve(quads));

    stream.pipe(parser);
  });
}

function getLocalName(iri: string): string | undefined {
  const idxHash = iri.lastIndexOf("#");
  if (idxHash >= 0 && idxHash < iri.length - 1) {
    return iri.slice(idxHash + 1);
  }
  const idxSlash = iri.lastIndexOf("/");
  if (idxSlash >= 0 && idxSlash < iri.length - 1) {
    return iri.slice(idxSlash + 1);
  }
  const idxColon = iri.indexOf(":");
  if (idxColon > 0 && idxColon < iri.length - 1) {
    return iri.slice(idxColon + 1);
  }
  return undefined;
}

function compactIri(iri: string, namespaces: Record<string, string>): string {
  for (const [prefix, nsIri] of Object.entries(namespaces)) {
    if (iri.startsWith(nsIri)) {
      return `${prefix}:${iri.slice(nsIri.length)}`;
    }
  }
  if (iri.startsWith("http://www.w3.org/2001/XMLSchema#")) {
    return `xsd:${iri.slice("http://www.w3.org/2001/XMLSchema#".length)}`;
  }
  return iri;
}

function isReservedTerm(term: string): boolean {
  return term.startsWith("@");
}
