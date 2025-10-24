// Core types IRI tests

import { describe, expect, it } from "vitest";
import { getIRIPrefix, getIRILocalName } from "../iri.js";

describe("getIRIPrefix", () => {
  it("should extract prefix from prefixed IRI", () => {
    expect(getIRIPrefix("foaf:name")).toBe("foaf");
    expect(getIRIPrefix("rdf:type")).toBe("rdf");
    expect(getIRIPrefix("ex:Person")).toBe("ex");
  });

  it("should return undefined for full URIs", () => {
    expect(getIRIPrefix("http://xmlns.com/foaf/0.1/name")).toBeUndefined();
    expect(getIRIPrefix("https://example.org/Person")).toBeUndefined();
  });

  it("should return undefined for IRIs without colon", () => {
    expect(getIRIPrefix("name")).toBeUndefined();
    expect(getIRIPrefix("")).toBeUndefined();
  });

  it("should return undefined for IRIs with colon but no prefix", () => {
    expect(getIRIPrefix(":name")).toBeUndefined();
  });
});

describe("getIRILocalName", () => {
  it("should extract local name from prefixed IRI", () => {
    expect(getIRILocalName("foaf:name")).toBe("name");
    expect(getIRILocalName("rdf:type")).toBe("type");
    expect(getIRILocalName("ex:Person")).toBe("Person");
  });

  it("should return local name for full URIs", () => {
    expect(getIRILocalName("http://xmlns.com/foaf/0.1/name")).toBe("name");
    expect(getIRILocalName("https://example.org/Person")).toBe("Person");
    expect(getIRILocalName("http://example.org#Person")).toBe("Person");
  });

  it("should return original string for IRIs without colon", () => {
    expect(getIRILocalName("name")).toBe("name");
    expect(getIRILocalName("")).toBe("");
  });

  it("should return part after colon for IRIs with colon", () => {
    expect(getIRILocalName(":name")).toBe("name");
    expect(getIRILocalName("prefix:")).toBe("");
    expect(getIRILocalName("name")).toBe("name");
  });
});
