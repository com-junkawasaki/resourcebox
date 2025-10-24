// DAG: core-test
// defineShape API tests

import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { cardinality } from "../dsl/cardinality.js";
import { defineShape } from "../dsl/define-shape.js";
import { iri } from "../dsl/iri.js";
import { range } from "../dsl/range.js";

describe("defineShape", () => {
  it("should create a valid shape", () => {
    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String({ format: "uri" }),
        "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
        email: Type.String({ format: "email" }),
      }),
      props: {
        email: {
          predicate: iri("ex:hasEmail"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
      description: "A person entity",
    });

    expect(Person.classIri).toBe("ex:Person");
    expect(Person.shapeId).toBe("Person");
    expect(Person.description).toBe("A person entity");
    expect(Person.props.email?.predicate).toBe("ex:hasEmail");
  });

  it("should use custom shapeId if provided", () => {
    const Custom = defineShape({
      classIri: iri("ex:MyClass"),
      schema: Type.Object({
        "@id": Type.String({ format: "uri" }),
        "@type": Type.Array(Type.String({ format: "uri" })),
      }),
      props: {},
      shapeId: "CustomId",
    });

    expect(Custom.shapeId).toBe("CustomId");
  });

  it("should throw on self-extending class", () => {
    expect(() => {
      defineShape({
        classIri: iri("ex:Person"),
        schema: Type.Object({
          "@id": Type.String(),
          "@type": Type.Array(Type.String()),
        }),
        props: {},
        extends: [iri("ex:Person")], // Self-reference
      });
    }).toThrow(/circular/i);
  });

  it("should throw on props-schema inconsistency", () => {
    expect(() => {
      defineShape({
        classIri: iri("ex:Person"),
        schema: Type.Object({
          "@id": Type.String(),
          "@type": Type.Array(Type.String()),
          email: Type.String(),
        }),
        props: {
          email: {
            predicate: iri("ex:hasEmail"),
            cardinality: cardinality({ min: 1, max: 1, required: true }),
            range: range.datatype(iri("xsd:string")),
          },
          age: {
            // age is not in schema
            predicate: iri("ex:hasAge"),
            cardinality: cardinality({ min: 0, max: 1, required: false }),
            range: range.datatype(iri("xsd:integer")),
          },
        },
      });
    }).toThrow(/do not exist in schema/i);
  });

  it("should throw on invalid PropertyMeta", () => {
    expect(() => {
      defineShape({
        classIri: iri("ex:Person"),
        schema: Type.Object({
          "@id": Type.String(),
          "@type": Type.Array(Type.String()),
          email: Type.String(),
        }),
        props: {
          email: {
            predicate: iri("ex:hasEmail"),
            cardinality: cardinality({ min: 1, max: 5, required: true }),
            range: range.datatype(iri("xsd:string")),
            functional: true, // But max is 5, not 1
          },
        },
      });
    }).toThrow(/Functional/i);
  });

  it("should allow shape with extends", () => {
    const Agent = defineShape({
      classIri: iri("ex:Agent"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        name: Type.String(),
      }),
      props: {
        name: {
          predicate: iri("ex:hasName"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
    });

    const Person = defineShape({
      classIri: iri("ex:Person"),
      schema: Type.Object({
        "@id": Type.String(),
        "@type": Type.Array(Type.String()),
        name: Type.String(),
        email: Type.String(),
      }),
      props: {
        name: {
          predicate: iri("ex:hasName"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
        email: {
          predicate: iri("ex:hasEmail"),
          cardinality: cardinality({ min: 1, max: 1, required: true }),
          range: range.datatype(iri("xsd:string")),
        },
      },
      extends: [Agent.classIri],
    });

    expect(Person.extends).toContain("ex:Agent");
  });
});
