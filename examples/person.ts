// DAG: examples
// Person shape example from design document

import { Type } from "@sinclair/typebox";
import { defineShape, iri, cardinality, range } from "@gftdcojp/shapebox-core";

/**
 * Person shape definition.
 * 
 * This demonstrates:
 * - Class IRI definition (ex:Person)
 * - TypeBox schema with required and optional properties
 * - Property metadata with RDF predicates
 * - Cardinality constraints (required email, optional manager)
 * - Range constraints (datatype for email, shape reference for manager)
 * - Inheritance (extends ex:Agent)
 */
export const Person = defineShape({
  classIri: iri("ex:Person"),
  
  schema: Type.Object({
    "@id": Type.String({ format: "uri" }),
    "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
    
    email: Type.String({ format: "email" }),
    
    manager: Type.Optional(Type.String({ format: "uri" })),
  }),
  
  props: {
    email: {
      predicate: iri("ex:hasEmail"),
      cardinality: cardinality({ min: 1, max: 1, required: true }),
      range: range.datatype(iri("xsd:string")),
      description: "Person's email address",
    },
    manager: {
      predicate: iri("ex:hasManager"),
      cardinality: cardinality({ min: 0, max: 1, required: false }),
      range: range.shape("ex:Person"),
      description: "Person's manager (also a Person)",
    },
  },
  
  extends: [iri("ex:Agent")],
  
  description: "A person entity",
  label: "Person",
});

// Example: Valid person data
export const johnDoe = {
  "@id": "http://example.org/person/john",
  "@type": ["ex:Person", "ex:Agent"],
  email: "john@example.com",
  manager: "http://example.org/person/jane",
};

// Example: Invalid person data (missing required email)
export const invalidPerson = {
  "@id": "http://example.org/person/invalid",
  "@type": ["ex:Person"],
  // missing email - will fail validation
};

// Example: Invalid person data (wrong @type)
export const wrongTypePerson = {
  "@id": "http://example.org/person/wrong",
  "@type": ["ex:Project"], // should be ex:Person
  email: "wrong@example.com",
};

