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
    ...(options.label !== undefined && { label: options.label }),
    ...(options.comment !== undefined && { comment: options.comment }),
    ...(options.domain !== undefined && { domain: options.domain }),
    ...(options.range !== undefined && { range: options.range }),
    ...(options.subPropertyOf !== undefined && { subPropertyOf: options.subPropertyOf }),
    ...(options.functional !== undefined && { functional: options.functional }),
    ...(options.inverseFunctional !== undefined && { inverseFunctional: options.inverseFunctional }),
    ...(options.transitive !== undefined && { transitive: options.transitive }),
    ...(options.symmetric !== undefined && { symmetric: options.symmetric }),
    ...(options.asymmetric !== undefined && { asymmetric: options.asymmetric }),
    ...(options.reflexive !== undefined && { reflexive: options.reflexive }),
    ...(options.irreflexive !== undefined && { irreflexive: options.irreflexive }),
    ...(options.inverseOf !== undefined && { inverseOf: options.inverseOf }),
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

