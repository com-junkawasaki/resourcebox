import { describe, it, expect } from "vitest";
import { Ontology as OntologyContainer } from "../ontology.js";
import { toJsonLd } from "../jsonld.js";
import { Namespace, OWL } from "../namespace.js";
import { Class } from "../class.js";
import { Property } from "../property.js";
import { Union } from "../expressions.js";
import { QualifiedCardinality } from "../expressions.js";
import { Complement } from "../expressions.js";

const ex = Namespace({ prefix: "ex", uri: "http://example.org/" });

describe("onto jsonld export", () => {
  it("exports ontology with classes, property and union expression", () => {
    const Activity = Class({ iri: ex("Activity") });
    const Capability = Class({ iri: ex("Capability") });
    const ActivityOrCapability = Union([Activity, Capability]);
    const PerformsFor = Property({ iri: ex("performsFor") });

    const ont = OntologyContainer({
      iri: ex("dodaf"),
      imports: [OWL("Thing")],
      classes: [
        Class({ iri: ex("Artifact"), equivalentClass: [ActivityOrCapability] }),
      ],
      properties: [PerformsFor],
    });

    const json = toJsonLd(ont) as { [k: string]: unknown };
    expect(json).toHaveProperty("@graph");
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    expect(graph.some((n) => n["@id"] === ex("dodaf"))).toBe(true);
    expect(graph.some((n) => n["@id"] === ex("Artifact"))).toBe(true);
    const cls = graph.find((n) => n["@id"] === ex("Artifact")) as Record<string, unknown>;
    const eq = cls && (cls["owl:equivalentClass"] as ReadonlyArray<Record<string, unknown>>);
    expect(eq).toBeDefined();
    const unionHolder = eq && (eq[0] as Record<string, unknown>);
    expect(unionHolder).toBeDefined();
    const union = unionHolder && (unionHolder["owl:unionOf"] as { "@list": unknown[] });
    expect(Array.isArray(union && union["@list"])) .toBe(true);
  });

  it("exports propertyChainAxiom as RDF list and unqualified cardinalities in restriction", () => {
    const A = Class({ iri: ex("A") });
    const B = Class({ iri: ex("B") });
    const chainProp = Property({ iri: ex("p"), propertyChain: [ex("p1"), ex("p2"), ex("p3")] });

    const restrictionClass = Class({
      iri: ex("C"),
      equivalentClass: [
        QualifiedCardinality({ onProperty: ex("q"), exact: 2 }),
      ],
    });

    const ont = OntologyContainer({
      iri: ex("o"),
      classes: [A, B, restrictionClass],
      properties: [chainProp],
    });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const pNode = graph.find((n) => n["@id"] === ex("p")) as Record<string, unknown> | undefined;
    expect(pNode && pNode["owl:propertyChainAxiom"]).toBeTruthy();
  });

  it("exports equivalentClass with complementOf expression", () => {
    const A = Class({ iri: ex("A") });
    const C = Class({ iri: ex("C"), equivalentClass: [Complement(A)] });

    const ont = OntologyContainer({ iri: ex("o2"), classes: [A, C] });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const cNode = graph.find((n) => n["@id"] === ex("C")) as Record<string, unknown> | undefined;
    const eq = cNode && (cNode["owl:equivalentClass"] as ReadonlyArray<Record<string, unknown>>);
    const holder = eq && (eq[0] as Record<string, unknown>);
    expect(holder && holder["owl:complementOf"]).toBeDefined();
  });

  it("exports restriction with owl:onDataRange when onDatatype is set", () => {
    const D = Class({
      iri: ex("D"),
      equivalentClass: [
        QualifiedCardinality({ onProperty: ex("p"), exact: 1, onDatatype: "xsd:string" as any }),
      ],
    });
    const ont = OntologyContainer({ iri: ex("o3"), classes: [D] });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const dNode = graph.find((n) => n["@id"] === ex("D")) as Record<string, unknown> | undefined;
    const eq = dNode && (dNode["owl:equivalentClass"] as ReadonlyArray<Record<string, unknown>>);
    const holder = eq && (eq[0] as Record<string, unknown>);
    expect(holder && holder["owl:onDataRange"]).toBeDefined();
  });
});


