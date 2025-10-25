// Onto.Datatype tests

import { describe, expect, it } from "vitest";
import {
  Datatype,
  Integer,
  Boolean as OntoBoolean,
  Date as OntoDate,
  DateTime as OntoDateTime,
  String as OntoString,
  getDatatypeIRI,
  isDatatype,
} from "../datatype.js";

describe("Onto.Datatype", () => {
  it("should create a custom datatype", () => {
    const customType = Datatype("http://example.org/CustomType", "Custom Type");
    expect(customType.kind).toBe("Datatype");
    expect(customType.iri).toBe("http://example.org/CustomType");
    expect(customType.label).toBe("Custom Type");
  });

  it("should create datatype without label", () => {
    const customType = Datatype("http://example.org/CustomType");
    expect(customType.kind).toBe("Datatype");
    expect(customType.iri).toBe("http://example.org/CustomType");
    expect(customType.label).toBeUndefined();
  });

  describe("Built-in XSD datatypes", () => {
    it("should provide String datatype", () => {
      expect(OntoString.kind).toBe("Datatype");
      expect(OntoString.iri).toBe("http://www.w3.org/2001/XMLSchema#string");
      expect(OntoString.label).toBe("string");
    });

    it("should provide Integer datatype", () => {
      expect(Integer.kind).toBe("Datatype");
      expect(Integer.iri).toBe("http://www.w3.org/2001/XMLSchema#integer");
      expect(Integer.label).toBe("integer");
    });

    it("should provide Boolean datatype", () => {
      expect(OntoBoolean.kind).toBe("Datatype");
      expect(OntoBoolean.iri).toBe("http://www.w3.org/2001/XMLSchema#boolean");
      expect(OntoBoolean.label).toBe("boolean");
    });

    it("should provide Date datatype", () => {
      expect(OntoDate.kind).toBe("Datatype");
      expect(OntoDate.iri).toBe("http://www.w3.org/2001/XMLSchema#date");
      expect(OntoDate.label).toBe("date");
    });

    it("should provide DateTime datatype", () => {
      expect(OntoDateTime.kind).toBe("Datatype");
      expect(OntoDateTime.iri).toBe("http://www.w3.org/2001/XMLSchema#dateTime");
      expect(OntoDateTime.label).toBe("dateTime");
    });
  });
});

describe("Onto.isDatatype", () => {
  it("should return true for datatype entities", () => {
    expect(isDatatype(OntoString)).toBe(true);
    expect(isDatatype(Integer)).toBe(true);
  });

  it("should return false for non-datatype entities", () => {
    expect(isDatatype("string")).toBe(false);
    expect(isDatatype({})).toBe(false);
    expect(isDatatype(null)).toBe(false);
  });
});

describe("Onto.getDatatypeIRI", () => {
  it("should return IRI from datatype", () => {
    expect(getDatatypeIRI(OntoString)).toBe("http://www.w3.org/2001/XMLSchema#string");
  });

  it("should return IRI string as-is", () => {
    const iri = "http://example.org/CustomType";
    expect(getDatatypeIRI(iri)).toBe(iri);
  });
});
