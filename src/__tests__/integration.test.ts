// Integration tests - Real-world usage examples

import { describe, expect, it } from "vitest";
import { Onto, Resource, Shape } from "../index.js";

describe("ResourceBox Integration", () => {
  it("should support full workflow: Onto -> Resource -> Shape -> Validate", () => {
    // 1. Define ontology
    const foaf = Onto.Namespace({
      prefix: "foaf",
      uri: "http://xmlns.com/foaf/0.1/",
    });

    const Person = Onto.Class({
      iri: foaf("Person"),
      label: "Person",
    });

    const name = Onto.Property({
      iri: foaf("name"),
      domain: [Person],
      range: [Onto.Datatype.String],
      functional: true,
    });

    // 2. Define resource
    const PersonResource = Resource.Object(
      {
        "@id": Resource.String({ format: "uri" }),
        "@type": Resource.Literal([foaf("Person")]),
        name: Resource.String({
          property: name,
          minLength: 1,
          required: true,
        }),
        email: Resource.String({
          property: foaf("mbox"),
          format: "email",
          optional: true,
        }),
      },
      {
        class: Person,
      }
    );

    // 3. Validate data
    const validData = {
      "@id": "http://example.org/john",
      "@type": [foaf("Person")],
      name: "John Doe",
      email: "john@example.org",
    };

    const result = Resource.validate(PersonResource, validData);
    if (!result.ok) {
      console.error("Validation errors:", result.errors);
    }
    expect(result.ok).toBe(true);

    // 4. Generate context
    const context = Resource.context(PersonResource, {
      includeNamespaces: true,
      namespaces: {
        foaf: "http://xmlns.com/foaf/0.1/",
      },
    });

    expect(context["@context"]).toBeDefined();
    expect(context["@context"].foaf).toBe("http://xmlns.com/foaf/0.1/");
  });

  it("should support auto-generating Shape from Resource", () => {
    const foaf = Onto.FOAF;

    const PersonResource = Resource.Object(
      {
        name: Resource.String({
          property: foaf("name"),
          required: true,
          minLength: 1,
        }),
        age: Resource.Number({
          property: foaf("age"),
          minimum: 0,
          optional: true,
        }),
      },
      {
        class: foaf("Person"),
      }
    );

    // Auto-generate shape
    const PersonShape = Shape.fromResource(PersonResource, {
      strict: true,
    });

    expect(PersonShape.targetClass).toBe(foaf("Person"));
    expect(PersonShape.property.name).toBeDefined();
    expect(PersonShape.property.name.minCount).toBe(1);
    expect(PersonShape.property.age).toBeDefined();
    expect(PersonShape.property.age.minCount).toBe(0);
  });

  it("should validate invalid data", () => {
    const PersonResource = Resource.Object({
      name: Resource.String({ minLength: 1 }),
      age: Resource.Number({ minimum: 0, maximum: 150 }),
    });

    const invalidData = {
      name: "", // Too short
      age: 200, // Too large
    };

    const result = Resource.validate(PersonResource, invalidData);
    expect(result.ok).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should support TypeBox-like Type.Static inference", () => {
    const PersonResource = Resource.Object({
      name: Resource.String(),
      age: Resource.Number({ optional: true }),
    });

    // Type inference check (compile-time only)
    type PersonType = Resource.Static<typeof PersonResource>;

    // Runtime check: data matches expected structure
    const data: PersonType = {
      name: "John",
      age: 30,
    };

    expect(data.name).toBe("John");
    expect(data.age).toBe(30);
  });
});
