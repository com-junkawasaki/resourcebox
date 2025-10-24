// Onto.Class - Define OWL/RDFS classes

import type { OntoClass, OntoIRI } from "./types.js";

/**
 * Options for defining an ontology class
 */
export interface ClassOptions {
  readonly iri: OntoIRI;
  readonly label?: string;
  readonly comment?: string;
  readonly subClassOf?: ReadonlyArray<OntoIRI | OntoClass>;
  readonly disjointWith?: ReadonlyArray<OntoIRI | OntoClass>;
}

/**
 * Define an OWL/RDFS Class
 * 
 * @example
 * ```ts
 * const Person = Onto.Class({
 *   iri: foaf("Person"),
 *   label: "Person",
 *   comment: "A person",
 *   subClassOf: [foaf("Agent")]
 * })
 * ```
 */
export function Class(options: ClassOptions): OntoClass {
  return {
    kind: "Class",
    iri: options.iri,
    ...(options.label !== undefined && { label: options.label }),
    ...(options.comment !== undefined && { comment: options.comment }),
    ...(options.subClassOf !== undefined && { subClassOf: options.subClassOf }),
    ...(options.disjointWith !== undefined && { disjointWith: options.disjointWith }),
  };
}

/**
 * Helper to check if an entity is an OntoClass
 */
export function isClass(entity: unknown): entity is OntoClass {
  return (
    typeof entity === "object" &&
    entity !== null &&
    "kind" in entity &&
    entity.kind === "Class"
  );
}

/**
 * Helper to get class IRI from OntoClass or OntoIRI
 */
export function getClassIRI(classEntity: OntoClass | OntoIRI): OntoIRI {
  return typeof classEntity === "string" ? classEntity : classEntity.iri;
}

