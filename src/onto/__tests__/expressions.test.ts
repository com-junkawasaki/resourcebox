import { describe, expect, it } from "vitest";
import { Namespace } from "../namespace.js";
import { Class } from "../class.js";
import {
  Union,
  Intersection,
  Complement,
  OneOf,
  SomeValuesFrom,
  AllValuesFrom,
  MinQualifiedCardinality,
  MaxQualifiedCardinality,
  QualifiedCardinality,
} from "../expressions.js";

const ex = Namespace({ prefix: "ex", uri: "http://example.org/" });

describe("Onto.Expressions builders", () => {
  it("builds union/intersection/complement/oneOf", () => {
    const A = Class({ iri: ex("A") });
    const B = Class({ iri: ex("B") });
    const u = Union([A, B]);
    const i = Intersection([A, B]);
    const c = Complement(A);
    const o = OneOf([ex("a1"), ex("a2")]);

    expect(u.kind).toBe("Union");
    expect((u as any).operands.length).toBe(2);
    expect(i.kind).toBe("Intersection");
    expect(c.kind).toBe("Complement");
    expect((c as any).of).toBeDefined();
    expect(o.kind).toBe("OneOf");
    expect((o as any).individuals.length).toBe(2);
  });

  it("builds restrictions (some/all/qualified cardinalities)", () => {
    const A = Class({ iri: ex("A") });
    const some = SomeValuesFrom({ onProperty: ex("p"), onClass: A });
    const all = AllValuesFrom({ onProperty: ex("p"), onClass: A });
    const minQ = MinQualifiedCardinality({ onProperty: ex("p"), min: 1, onClass: A });
    const maxQ = MaxQualifiedCardinality({ onProperty: ex("p"), max: 2, onClass: A });
    const q = QualifiedCardinality({ onProperty: ex("p"), exact: 3, onDatatype: ex("dt") });

    expect(some.kind).toBe("Restriction");
    expect((some as any).someValuesFrom).toBeDefined();
    expect(all.kind).toBe("Restriction");
    expect((all as any).allValuesFrom).toBeDefined();
    expect(minQ.kind).toBe("Restriction");
    expect((minQ as any).minQualifiedCardinality).toBe(1);
    expect(maxQ.kind).toBe("Restriction");
    expect((maxQ as any).maxQualifiedCardinality).toBe(2);
    expect(q.kind).toBe("Restriction");
    expect((q as any).qualifiedCardinality).toBe(3);
  });
});


