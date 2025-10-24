// DAG: core-types
// PropertyMeta: RDF/OWL/SHACL-lite metadata for shape properties

import type { Cardinality } from "./cardinality.ts";
import type { IRI } from "./iri.ts";
import type { Range } from "./range.ts";

/**
 * Property metadata definition.
 *
 * This attaches RDF/OWL/SHACL-lite semantic metadata to a property defined in TypeBox schema.
 * It bridges the gap between TypeScript type structure and RDF semantics.
 *
 * @property predicate - RDF property IRI (e.g., ex:hasEmail, foaf:name)
 * @property cardinality - Min/max occurrence constraints (SHACL-lite)
 * @property range - Expected value type: either literal datatype or shape reference
 * @property description - Human-readable description (maps to rdfs:comment)
 * @property inverseOf - Optional inverse property IRI (OWL owl:inverseOf)
 * @property symmetric - Whether this property is symmetric (OWL owl:SymmetricProperty)
 *
 * @example
 * ```ts
 * const emailMeta: PropertyMeta = {
 *   predicate: iri("ex:hasEmail"),
 *   cardinality: { min: 1, max: 1, required: true },
 *   range: { kind: "datatype", datatype: iri("xsd:string") },
 *   description: "Person's email address"
 * };
 *
 * const managerMeta: PropertyMeta = {
 *   predicate: iri("ex:hasManager"),
 *   cardinality: { min: 0, max: 1, required: false },
 *   range: { kind: "shape", shapeId: "ex:Person" },
 *   description: "Person's manager (also a Person)"
 * };
 * ```
 */
export interface PropertyMeta {
  /**
   * RDF property IRI.
   * This is the actual predicate used in RDF triples.
   */
  readonly predicate: IRI<"Property">;

  /**
   * Cardinality constraint.
   * Used for both compile-time checking and runtime shape validation.
   */
  readonly cardinality: Cardinality;

  /**
   * Range constraint: datatype or shape reference.
   * - datatype: Property has literal values (e.g., xsd:string, xsd:integer)
   * - shape: Property has IRI references to other shapes (e.g., ex:Person)
   */
  readonly range: Range;

  /**
   * Human-readable description (maps to rdfs:comment).
   */
  readonly description?: string;

  /**
   * Inverse property IRI (OWL owl:inverseOf).
   * If property P has inverseOf Q, then (A P B) implies (B Q A).
   */
  readonly inverseOf?: IRI<"Property">;

  /**
   * Symmetric property flag (OWL owl:SymmetricProperty).
   * If property P is symmetric, then (A P B) implies (B P A).
   */
  readonly symmetric?: boolean;

  /**
   * Functional property flag (OWL owl:FunctionalProperty).
   * If true, max cardinality should be 1.
   */
  readonly functional?: boolean;
}

/**
 * Validate PropertyMeta semantic consistency.
 *
 * @param meta - PropertyMeta to validate
 * @returns Error message if inconsistent, undefined if valid
 */
export function validatePropertyMeta(meta: PropertyMeta): string | undefined {
  // If functional, max should be 1
  if (meta.functional && meta.cardinality.max !== 1) {
    return "Functional property must have max cardinality of 1";
  }

  // Symmetric properties must have shape range (not datatype)
  if (meta.symmetric && meta.range.kind === "datatype") {
    return "Symmetric property must have shape range, not datatype";
  }

  // InverseOf must have shape range
  if (meta.inverseOf && meta.range.kind === "datatype") {
    return "Property with inverseOf must have shape range, not datatype";
  }

  return undefined;
}
