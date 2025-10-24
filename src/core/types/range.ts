// DAG: core-types
// Range type: discriminated union for datatype vs shape references

import type { IRI } from "./iri.js";

/**
 * Range constraint for a property.
 *
 * This is a discriminated union representing either:
 * - A datatype range (RDF literal type, e.g., xsd:string, xsd:integer)
 * - A shape range (reference to another Shape, e.g., ex:Person)
 *
 * This separation enforces the semantic distinction between:
 * - Properties with literal values (datatype)
 * - Properties with IRI references to other resources (shape)
 *
 * **The two kinds are mutually exclusive at compile time.**
 *
 * @example
 * ```ts
 * // Datatype range (literal)
 * const emailRange: Range = { kind: "datatype", datatype: iri("xsd:string") };
 *
 * // Shape range (IRI reference)
 * const managerRange: Range = { kind: "shape", shapeId: "ex:Person" };
 * ```
 */
export type Range =
  | { readonly kind: "datatype"; readonly datatype: IRI<"Datatype"> }
  | { readonly kind: "shape"; readonly shapeId: string };

/**
 * Type guard: check if range is a datatype range.
 */
export function isDatatypeRange(range: Range): range is Extract<Range, { kind: "datatype" }> {
  return range.kind === "datatype";
}

/**
 * Type guard: check if range is a shape range.
 */
export function isShapeRange(range: Range): range is Extract<Range, { kind: "shape" }> {
  return range.kind === "shape";
}

/**
 * Common XSD datatype IRIs.
 * These are used for literal property ranges.
 */
export const XSD_DATATYPES = {
  STRING: "xsd:string" as IRI<"Datatype">,
  INTEGER: "xsd:integer" as IRI<"Datatype">,
  DECIMAL: "xsd:decimal" as IRI<"Datatype">,
  BOOLEAN: "xsd:boolean" as IRI<"Datatype">,
  DATE: "xsd:date" as IRI<"Datatype">,
  DATE_TIME: "xsd:dateTime" as IRI<"Datatype">,
  TIME: "xsd:time" as IRI<"Datatype">,
  ANY_URI: "xsd:anyURI" as IRI<"Datatype">,
} as const;

/**
 * RDF/RDFS common datatype IRIs.
 */
export const RDF_DATATYPES = {
  LANG_STRING: "rdf:langString" as IRI<"Datatype">,
  HTML: "rdf:HTML" as IRI<"Datatype">,
  XML_LITERAL: "rdf:XMLLiteral" as IRI<"Datatype">,
} as const;
