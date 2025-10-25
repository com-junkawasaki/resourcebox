// Onto types - Core type definitions for ontology layer

/**
 * Ontology IRI (Internationalized Resource Identifier)
 * Represents a unique identifier in RDF/OWL
 */
export type OntoIRI = string & { readonly __brand: "OntoIRI" };

/**
 * Namespace function type
 * Allows calling namespace as function: foaf("Person") -> "http://xmlns.com/foaf/0.1/Person"
 */
export type NamespaceFunction = ((localName: string) => OntoIRI) & {
  readonly prefix: string;
  readonly uri: string;
};

/**
 * Ontology Class definition (OWL/RDFS Class)
 */
export interface OntoClass {
  readonly kind: "Class";
  readonly iri: OntoIRI;
  readonly label?: string;
  readonly comment?: string;
  readonly subClassOf?: ReadonlyArray<OntoIRI | OntoClass>;
  readonly disjointWith?: ReadonlyArray<OntoIRI | OntoClass>;
  /** owl:equivalentClass */
  readonly equivalentClass?: ReadonlyArray<OntoIRI | OntoClass | ClassExpression>;
  /** Additional annotations (rdfs:*, skos:*, custom) */
  readonly annotations?: ReadonlyArray<Annotation>;
}

/**
 * Ontology Property definition (RDF Property, OWL ObjectProperty/DatatypeProperty)
 */
export interface OntoProperty {
  readonly kind: "Property";
  readonly iri: OntoIRI;
  readonly label?: string;
  readonly comment?: string;
  readonly domain?: ReadonlyArray<OntoIRI | OntoClass>;
  readonly range?: ReadonlyArray<OntoIRI | OntoClass | OntoDatatype>;
  readonly subPropertyOf?: ReadonlyArray<OntoIRI | OntoProperty>;

  // OWL characteristics
  readonly functional?: boolean; // owl:FunctionalProperty
  readonly inverseFunctional?: boolean; // owl:InverseFunctionalProperty
  readonly transitive?: boolean; // owl:TransitiveProperty
  readonly symmetric?: boolean; // owl:SymmetricProperty
  readonly asymmetric?: boolean; // owl:AsymmetricProperty
  readonly reflexive?: boolean; // owl:ReflexiveProperty
  readonly irreflexive?: boolean; // owl:IrreflexiveProperty
  readonly inverseOf?: OntoIRI | OntoProperty;
  /** owl:equivalentProperty */
  readonly equivalentProperty?: ReadonlyArray<OntoIRI | OntoProperty>;
  /** owl:propertyChainAxiom */
  readonly propertyChain?: ReadonlyArray<OntoIRI | OntoProperty>;
  /** Additional annotations */
  readonly annotations?: ReadonlyArray<Annotation>;
}

/**
 * XSD Datatype reference
 */
export interface OntoDatatype {
  readonly kind: "Datatype";
  readonly iri: OntoIRI;
  readonly label?: string;
}

/**
 * Helper to create branded OntoIRI
 */
export function iri(uri: string): OntoIRI {
  return uri as OntoIRI;
}

/**
 * Helper to extract IRI string from OntoClass, OntoProperty, or OntoDatatype
 */
export function getIRI(entity: OntoClass | OntoProperty | OntoDatatype | OntoIRI): OntoIRI {
  if (typeof entity === "string") {
    return entity;
  }
  return entity.iri;
}

// ---------------------------------------------------------------------------
// OWL: Class Expressions & Restrictions (structural only, no reasoning)
// ---------------------------------------------------------------------------

/**
 * Annotation assertion for ontology elements
 */
export interface Annotation {
  readonly property: OntoIRI;
  readonly value: string | number | boolean | OntoIRI;
}

/** OWL Restriction (qualified variants supported) */
export interface Restriction {
  readonly kind: "Restriction";
  readonly onProperty: OntoIRI | OntoProperty;
  readonly someValuesFrom?: OntoIRI | OntoClass | ClassExpression;
  readonly allValuesFrom?: OntoIRI | OntoClass | ClassExpression;
  readonly hasValue?: string | number | boolean | OntoIRI;
  // Qualified cardinalities
  readonly minQualifiedCardinality?: number;
  readonly maxQualifiedCardinality?: number;
  readonly qualifiedCardinality?: number;
  readonly onClass?: OntoIRI | OntoClass | ClassExpression;
  readonly onDatatype?: OntoIRI; // typically XSD datatypes
  // Unqualified cardinalities
  readonly minCardinality?: number;
  readonly maxCardinality?: number;
  readonly cardinality?: number;
}

/** Discriminated unions for class expressions */
export type ClassExpression =
  | {
      readonly kind: "Union";
      readonly operands: ReadonlyArray<OntoIRI | OntoClass | ClassExpression>;
    }
  | {
      readonly kind: "Intersection";
      readonly operands: ReadonlyArray<OntoIRI | OntoClass | ClassExpression>;
    }
  | {
      readonly kind: "Complement";
      readonly of: OntoIRI | OntoClass | ClassExpression;
    }
  | {
      readonly kind: "OneOf"; // Enumerated class (owl:oneOf)
      readonly individuals: ReadonlyArray<OntoIRI>;
    }
  | Restriction;

// ---------------------------------------------------------------------------
// Ontology container (imports, annotations, members)
// ---------------------------------------------------------------------------

export interface Ontology {
  readonly iri: OntoIRI;
  readonly imports?: ReadonlyArray<OntoIRI>; // owl:imports
  readonly annotations?: ReadonlyArray<Annotation>;
  readonly classes?: ReadonlyArray<OntoClass>;
  readonly properties?: ReadonlyArray<OntoProperty>;
}
