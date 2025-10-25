import { describe, expect, it } from "vitest";
import { Namespace } from "../../onto/namespace.js";
import { Define } from "../define.js";
import { toJsonLd } from "../jsonld.js";
import { Property } from "../property.js";

const ex = Namespace({ prefix: "ex", uri: "http://example.org/" });

describe("shape jsonld export", () => {
  it("exports NodeShape with SHACL-lite constraints", () => {
    const shape = Define({
      targetClass: ex("Person"),
      property: {
        email: Property({
          path: ex("hasEmail"),
          minCount: 1,
          maxCount: 1,
          nodeKind: "Literal",
          pattern: "@",
          in: ["a@example.org", "b@example.org"],
        }),
        knows: Property({
          path: ex("knows"),
          nodeKind: "IRI",
          hasValue: ex("alice"),
        }),
      },
      closed: true,
    });

    const json = toJsonLd(shape) as { [k: string]: unknown };
    expect(json).toHaveProperty("@graph");
    const node = (json["@graph"] as ReadonlyArray<Record<string, unknown>>)[0];
    expect(node["sh:targetClass"]).toBe(ex("Person"));
    expect(Array.isArray(node["sh:property"]).toBeTruthy);
  });
});
