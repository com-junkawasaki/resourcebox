// Ontology container (no reasoning)

import type { OntoClass, OntoProperty, Ontology as OntologyType, OntoIRI, Annotation } from "./types.js";

export interface OntologyOptions {
  readonly iri: OntoIRI;
  readonly imports?: ReadonlyArray<OntoIRI>;
  readonly annotations?: ReadonlyArray<Annotation>;
  readonly classes?: ReadonlyArray<OntoClass>;
  readonly properties?: ReadonlyArray<OntoProperty>;
}

export function Ontology(options: OntologyOptions): OntologyType {
  return {
    iri: options.iri,
    ...(options.imports !== undefined && { imports: options.imports }),
    ...(options.annotations !== undefined && { annotations: options.annotations }),
    ...(options.classes !== undefined && { classes: options.classes }),
    ...(options.properties !== undefined && { properties: options.properties }),
  };
}


