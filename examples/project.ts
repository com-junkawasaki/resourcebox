// DAG: examples
// Project shape example

import { cardinality, defineShape, iri, range } from "@gftdcojp/shapebox-core";
import { Type } from "@sinclair/typebox";

/**
 * Project shape definition.
 *
 * This demonstrates:
 * - Multiple properties with different cardinalities
 * - Array properties (members: one or more)
 * - Shape references to other shapes (Person)
 */
export const Project = defineShape({
  classIri: iri("ex:Project"),

  schema: Type.Object({
    "@id": Type.String({ format: "uri" }),
    "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),

    title: Type.String(),

    description: Type.Optional(Type.String()),

    members: Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
  }),

  props: {
    title: {
      predicate: iri("ex:hasTitle"),
      cardinality: cardinality({ min: 1, max: 1, required: true }),
      range: range.datatype(iri("xsd:string")),
      description: "Project title",
    },
    description: {
      predicate: iri("ex:hasDescription"),
      cardinality: cardinality({ min: 0, max: 1, required: false }),
      range: range.datatype(iri("xsd:string")),
      description: "Project description",
    },
    members: {
      predicate: iri("ex:hasMember"),
      cardinality: cardinality({ min: 1, max: undefined, required: true }),
      range: range.shape("ex:Person"),
      description: "Project members (references to Person)",
    },
  },

  description: "A project entity",
  label: "Project",
});

// Example: Valid project data
export const alphaProject = {
  "@id": "http://example.org/project/alpha",
  "@type": ["ex:Project"],
  title: "Project Alpha",
  description: "A sample project",
  members: ["http://example.org/person/john", "http://example.org/person/jane"],
};
