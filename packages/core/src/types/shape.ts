// DAG: core-types
// ShapeDefinition: top-level shape structure combining TypeBox schema + RDF/OWL metadata

import type { TObject, TProperties } from "@sinclair/typebox";
import type { IRI } from "./iri.ts";
import type { PropertyMeta } from "./property.ts";

/**
 * Shape definition combining TypeBox schema with RDF/OWL/SHACL-lite metadata.
 * 
 * This is the core data structure of shapebox. It represents a "class" in RDF/OWL terms,
 * with both structural constraints (TypeBox schema) and semantic metadata (RDF properties).
 * 
 * @template TSchema - TypeBox TObject type representing the JSON-LD node structure
 * 
 * @property classIri - RDF class IRI (e.g., ex:Person, foaf:Person)
 * @property schema - TypeBox schema defining the structure (JSON-LD node shape)
 * @property props - Map of property names to their RDF/OWL/SHACL metadata
 * @property extends - Array of parent class IRIs (rdfs:subClassOf)
 * @property description - Human-readable description (rdfs:comment)
 * @property label - Human-readable label (rdfs:label)
 * 
 * @example
 * ```ts
 * const PersonShape: ShapeDefinition<TObject> = {
 *   classIri: iri("ex:Person"),
 *   schema: Type.Object({
 *     "@id": Type.String({ format: "uri" }),
 *     "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
 *     email: Type.String({ format: "email" }),
 *   }),
 *   props: {
 *     email: {
 *       predicate: iri("ex:hasEmail"),
 *       cardinality: { min: 1, max: 1, required: true },
 *       range: { kind: "datatype", datatype: iri("xsd:string") },
 *     },
 *   },
 *   extends: [iri("ex:Agent")],
 *   description: "A person entity",
 * };
 * ```
 */
export interface ShapeDefinition<TSchema extends TObject = TObject> {
  /**
   * RDF class IRI for this shape.
   * This will appear in @type field of JSON-LD nodes.
   */
  readonly classIri: IRI<"Class">;
  
  /**
   * TypeBox schema defining the JSON-LD node structure.
   * This is used for Ajv-based structural validation.
   */
  readonly schema: TSchema;
  
  /**
   * Property metadata map.
   * Keys must match property names in the schema (except @id, @type, @context).
   * Values provide RDF/OWL/SHACL-lite semantics for each property.
   */
  readonly props: {
    readonly [K in keyof TProperties<TSchema>]?: PropertyMeta;
  };
  
  /**
   * Parent class IRIs (rdfs:subClassOf).
   * This shape inherits properties and constraints from parent shapes.
   */
  readonly extends?: ReadonlyArray<IRI<"Class">>;
  
  /**
   * Human-readable description (rdfs:comment).
   */
  readonly description?: string;
  
  /**
   * Human-readable label (rdfs:label).
   */
  readonly label?: string;
  
  /**
   * Shape ID for internal reference.
   * Used in range.shape(...) to reference this shape from other shapes.
   */
  readonly shapeId?: string;
}

/**
 * Resolved Shape type returned by defineShape().
 * This includes the shape ID for cross-referencing.
 * 
 * @template TSchema - TypeBox TObject type
 */
export interface Shape<TSchema extends TObject = TObject> extends ShapeDefinition<TSchema> {
  readonly shapeId: string;
}

/**
 * Extract the TypeBox schema type from a Shape.
 * 
 * @example
 * ```ts
 * type PersonSchema = ShapeSchemaType<typeof PersonShape>;
 * // TObject with { "@id": TString, "email": TString, ... }
 * ```
 */
export type ShapeSchemaType<S extends Shape> = S extends Shape<infer TSchema> ? TSchema : never;

/**
 * Extract TypeScript type from a Shape's schema.
 * 
 * @example
 * ```ts
 * type PersonData = ShapeDataType<typeof PersonShape>;
 * // { "@id": string; email: string; ... }
 * ```
 */
export type ShapeDataType<S extends Shape> = S extends Shape<infer TSchema>
  ? TSchema extends TObject
    ? { [K in keyof TProperties<TSchema>]: unknown } // Simplified; real type would use TypeBox Static<>
    : never
  : never;

