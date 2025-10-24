// Onto.Property - Define OWL/RDF properties

import type { OntoClass, OntoDatatype, OntoIRI, OntoProperty } from "./types.js";

/**
 * Options for defining an ontology property
 */
export interface PropertyOptions {
  readonly iri: OntoIRI;
  readonly label?: string;
  readonly comment?: string;
  readonly domain?: ReadonlyArray<OntoIRI | OntoClass>;
  readonly range?: ReadonlyArray<OntoIRI | OntoClass | OntoDatatype>;
  readonly subPropertyOf?: ReadonlyArray<OntoIRI | OntoProperty>;
  
  // OWL characteristics
  readonly functional?: boolean;
  readonly inverseFunctional?: boolean;
  readonly transitive?: boolean;
  readonly symmetric?: boolean;
  readonly asymmetric?: boolean;
  readonly reflexive?: boolean;
  readonly irreflexive?: boolean;
  readonly inverseOf?: OntoIRI | OntoProperty;
}

/**
 * Define an RDF Property (OWL ObjectProperty or DatatypeProperty)
 * 
 * @example
 * ```ts
 * const name = Onto.Property({
 *   iri: foaf("name"),
 *   label: "name",
 *   domain: [Person],
 *   range: [Onto.Datatype.String],
 *   functional: true
 * })
 * 
 * const knows = Onto.Property({
 *   iri: foaf("knows"),
 *   label: "knows",
 *   domain: [Person],
 *   range: [Person],
 *   symmetric: true
 * })
 * ```
 */
export function Property(options: PropertyOptions): OntoProperty {
  return {
    kind: "Property",
    iri: options.iri,
    label: options.label,
    comment: options.comment,
    domain: options.domain,
    range: options.range,
    subPropertyOf: options.subPropertyOf,
    functional: options.functional,
    inverseFunctional: options.inverseFunctional,
    transitive: options.transitive,
    symmetric: options.symmetric,
    asymmetric: options.asymmetric,
    reflexive: options.reflexive,
    irreflexive: options.irreflexive,
    inverseOf: options.inverseOf,
  };
}

/**
 * Helper to check if an entity is an OntoProperty
 */
export function isProperty(entity: unknown): entity is OntoProperty {
  return (
    typeof entity === "object" &&
    entity !== null &&
    "kind" in entity &&
    entity.kind === "Property"
  );
}

/**
 * Helper to get property IRI from OntoProperty or OntoIRI
 */
export function getPropertyIRI(propertyEntity: OntoProperty | OntoIRI): OntoIRI {
  return typeof propertyEntity === "string" ? propertyEntity : propertyEntity.iri;
}

