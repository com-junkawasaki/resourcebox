// DAG: core-api
// IRI helper function for creating branded IRI types

import type { IRI } from "../types/iri.ts";

/**
 * Create a branded IRI from a string.
 * 
 * This function provides compile-time type safety for IRI strings.
 * The runtime behavior is a simple identity function (returns the input string),
 * but the type signature ensures type safety through branding.
 * 
 * @template T - Optional semantic tag for the IRI (e.g., "Class", "Property", "Datatype")
 * @param uri - URI string (can be prefixed like "ex:Person" or full URI like "http://example.org/Person")
 * @returns Branded IRI type
 * 
 * @example
 * ```ts
 * // Class IRI
 * const personClass = iri<"Class">("ex:Person");
 * const agentClass = iri<"Class">("http://example.org/Agent");
 * 
 * // Property IRI
 * const emailProp = iri<"Property">("ex:hasEmail");
 * 
 * // Datatype IRI
 * const stringType = iri<"Datatype">("xsd:string");
 * 
 * // Generic IRI (no tag)
 * const someIri = iri("ex:something");
 * ```
 */
export function iri<T extends string = string>(uri: string): IRI<T> {
  return uri as IRI<T>;
}

/**
 * Create a class IRI (convenience wrapper).
 * 
 * @param uri - URI string
 * @returns Branded IRI with "Class" tag
 */
export function classIri(uri: string): IRI<"Class"> {
  return iri<"Class">(uri);
}

/**
 * Create a property IRI (convenience wrapper).
 * 
 * @param uri - URI string
 * @returns Branded IRI with "Property" tag
 */
export function propertyIri(uri: string): IRI<"Property"> {
  return iri<"Property">(uri);
}

/**
 * Create a datatype IRI (convenience wrapper).
 * 
 * @param uri - URI string
 * @returns Branded IRI with "Datatype" tag
 */
export function datatypeIri(uri: string): IRI<"Datatype"> {
  return iri<"Datatype">(uri);
}

