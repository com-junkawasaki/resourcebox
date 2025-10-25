// Resource.Object tests

import { describe, expect, it } from "vitest";
import { Class } from "../../onto/class.js";
import { FOAF } from "../../onto/namespace.js";
import { Literal } from "../literal.js";
import { ObjectDef as ResourceObject } from "../object.js";
import { String as RBString } from "../primitives.js";

describe("Resource.Object", () => {
  it("should create an object schema", () => {
    const schema = ResourceObject({
      name: RBString(),
    });

    expect(schema.kind).toBe("Object");
    expect(schema.properties.name).toBeDefined();
  });

  it("should support class option", () => {
    const Person = Class({
      iri: FOAF("Person"),
    });

    const schema = ResourceObject(
      {
        name: RBString(),
      },
      {
        class: Person,
      }
    );

    expect(schema.options?.class).toBe(Person);
  });

  it("should support complex properties", () => {
    const schema = ResourceObject(
      {
        "@id": RBString({ format: "uri" }),
        "@type": Literal(["foaf:Person"]),
        name: RBString({
          property: FOAF("name"),
          required: true,
        }),
        email: RBString({
          property: FOAF("mbox"),
          format: "email",
          optional: true,
        }),
      },
      {
        class: FOAF("Person"),
      }
    );

    expect(schema.properties["@id"]).toBeDefined();
    expect(schema.properties["@type"]).toBeDefined();
    expect(schema.properties.name.property).toBe(FOAF("name"));
    expect(schema.properties.email.property).toBe(FOAF("mbox"));
  });
});
