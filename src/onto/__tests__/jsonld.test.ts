import { describe, it, expect } from "vitest";
import { Ontology as OntologyContainer } from "../ontology.js";
import { toJsonLd } from "../jsonld.js";
import { Namespace, OWL } from "../namespace.js";
import { Class, Property } from "../class.js";
import { Union } from "../expressions.js";

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
  });
});


