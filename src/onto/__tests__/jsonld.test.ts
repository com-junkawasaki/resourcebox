import { describe, it, expect } from "vitest";
import { Ontology as OntologyContainer } from "../ontology.js";
import { toJsonLd } from "../jsonld.js";
import { Namespace, OWL, RDFS } from "../namespace.js";
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

  it("exports class with rdfs:subClassOf, owl:disjointWith and annotations", () => {
    const Super = Class({ iri: ex("Super") });
    const Other = Class({ iri: ex("Other") });
    const Sub = Class({
      iri: ex("Sub"),
      label: "Sub Label",
      comment: "Sub Comment",
      subClassOf: [Super],
      disjointWith: [Other],
    });
    const ont = OntologyContainer({
      iri: ex("o4"),
      classes: [Super, Other, Sub],
      annotations: [{ property: RDFS("seeAlso"), value: ex("doc") }],
    });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const sub = graph.find((n) => n["@id"] === ex("Sub")) as Record<string, unknown> | undefined;
    expect(sub && sub["rdfs:label"]).toBe("Sub Label");
    expect(sub && sub["rdfs:comment"]).toBe("Sub Comment");
    const sc = sub && (sub["rdfs:subClassOf"] as ReadonlyArray<string>);
    expect(sc && sc.includes(ex("Super"))).toBe(true);
    const dj = sub && (sub["owl:disjointWith"] as ReadonlyArray<string>);
    expect(dj && dj.includes(ex("Other"))).toBe(true);
  });

  it("exports property with owl:inverseOf, owl:equivalentProperty and multi-element propertyChainAxiom (RDF list)", () => {
    const p = Property({ iri: ex("p"), inverseOf: ex("q"), equivalentProperty: [ex("q")] });
    const q = Property({ iri: ex("q") });
    const c = Property({ iri: ex("c"), propertyChain: [ex("p1"), ex("p2")] });
    const ont = OntologyContainer({ iri: ex("o5"), properties: [p, q, c] });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const pNode = graph.find((n) => n["@id"] === ex("p")) as Record<string, unknown> | undefined;
    expect(pNode && pNode["owl:inverseOf"]).toBe(ex("q"));
    const eqp = pNode && (pNode["owl:equivalentProperty"] as ReadonlyArray<string>);
    expect(eqp && eqp.includes(ex("q"))).toBe(true);
    const cNode = graph.find((n) => n["@id"] === ex("c")) as Record<string, unknown> | undefined;
    const chain = cNode && (cNode["owl:propertyChainAxiom"] as Record<string, unknown>);
    expect(chain).toBeDefined();
    // rdf:first/rest nested
    const first = chain && (chain["rdf:first"] as string);
    const rest = chain && (chain["rdf:rest"] as Record<string, unknown>);
    expect(first).toBe(ex("p1"));
    expect(rest && rest["rdf:first"]).toBe(ex("p2"));
    expect(rest && rest["rdf:rest"]).toBe("rdf:nil");
  });

  it("exports equivalentClass with intersectionOf and oneOf lists", () => {
    const A = Class({ iri: ex("A") });
    const B = Class({ iri: ex("B") });
    const holder = Class({ iri: ex("Holder"), equivalentClass: [
      { kind: "Intersection", operands: [A, B] } as any,
      { kind: "OneOf", individuals: [ex("i1"), ex("i2")] } as any,
    ] });
    const ont = OntologyContainer({ iri: ex("o6"), classes: [A, B, holder] });
    const json = toJsonLd(ont) as { [k: string]: unknown };
    const graph = json["@graph"] as ReadonlyArray<Record<string, unknown>>;
    const h = graph.find((n) => n["@id"] === ex("Holder")) as Record<string, unknown> | undefined;
    const eq = h && (h["owl:equivalentClass"] as ReadonlyArray<Record<string, unknown>>);
    const inter = eq && (eq[0]["owl:intersectionOf"] as { "@list": unknown[] });
    const oneof = eq && (eq[1]["owl:oneOf"] as { "@list": unknown[] });
    expect(Array.isArray(inter && inter["@list"])) .toBe(true);
    expect(Array.isArray(oneof && oneof["@list"])) .toBe(true);
  });
});


