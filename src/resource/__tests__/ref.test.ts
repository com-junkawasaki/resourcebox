// Resource.Ref tests

import { describe, expect, it } from "vitest";
import { Ref } from "../ref.js";
import { Object as ResourceObject } from "../object.js";
import { String } from "../primitives.js";
import { FOAF } from "../../onto/namespace.js";
import { Class } from "../../onto/class.js";

describe("Resource.Ref", () => {
  const Person = Class({
    iri: FOAF("Person"),
  });

  it("should create a ref schema with IRI", () => {
    const schema = Ref(FOAF("Person"));
    expect(schema.kind).toBe("Ref");
    expect(schema.target).toBe(FOAF("Person"));
  });

  it("should create a ref schema with OntoClass", () => {
    const schema = Ref(Person);
    expect(schema.kind).toBe("Ref");
    expect(schema.target).toBe(Person);
  });

  it("should create a ref schema with ObjectSchema", () => {
    const PersonObject = ResourceObject({
      name: String(),
    }, {
      class: Person,
    });

    const schema = Ref(PersonObject);
    expect(schema.kind).toBe("Ref");
    expect(schema.target).toBe(PersonObject);
  });

  it("should accept options", () => {
    const schema = Ref(Person, {
      property: FOAF("knows"),
      required: true,
    });

    expect(schema.property).toBe(FOAF("knows"));
    expect(schema.options?.required).toBe(true);
  });

  it("should support optional", () => {
    const schema = Ref(Person, { optional: true });
    expect(schema.options?.optional).toBe(true);
  });
});

