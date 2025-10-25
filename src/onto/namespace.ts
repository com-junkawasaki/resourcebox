// Onto.Namespace - Create RDF namespace helper

import type { NamespaceFunction, OntoIRI } from "./types.js";
import { iri } from "./types.js";

/**
 * Namespace definition options
 */
export interface NamespaceOptions {
  readonly prefix: string;
  readonly uri: string;
}

/**
 * Create a namespace function for convenient IRI generation
 *
 * @example
 * ```ts
 * const foaf = Onto.Namespace({
 *   prefix: "foaf",
 *   uri: "http://xmlns.com/foaf/0.1/"
 * })
 *
 * foaf("Person")  // → "http://xmlns.com/foaf/0.1/Person"
 * foaf.prefix     // → "foaf"
 * foaf.uri        // → "http://xmlns.com/foaf/0.1/"
 * ```
 */
export function Namespace(options: NamespaceOptions): NamespaceFunction {
  const { prefix, uri } = options;

  // Ensure URI ends with / or #
  const baseUri = uri.endsWith("/") || uri.endsWith("#") ? uri : `${uri}/`;

  // Create function with properties
  const fn = ((localName: string): OntoIRI => {
    return iri(`${baseUri}${localName}`);
  }) as NamespaceFunction;

  // Attach metadata as read-only properties
  Object.defineProperty(fn, "prefix", {
    value: prefix,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  Object.defineProperty(fn, "uri", {
    value: baseUri,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  return fn;
}

/**
 * Common RDF/OWL namespaces
 */
export const RDF = Namespace({
  prefix: "rdf",
  uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
});

export const RDFS = Namespace({
  prefix: "rdfs",
  uri: "http://www.w3.org/2000/01/rdf-schema#",
});

export const OWL = Namespace({
  prefix: "owl",
  uri: "http://www.w3.org/2002/07/owl#",
});

export const XSD = Namespace({
  prefix: "xsd",
  uri: "http://www.w3.org/2001/XMLSchema#",
});

export const FOAF = Namespace({
  prefix: "foaf",
  uri: "http://xmlns.com/foaf/0.1/",
});
