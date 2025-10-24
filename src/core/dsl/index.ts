// DAG: core-api
// DSL API export index

export { iri, classIri, propertyIri, datatypeIri } from "./iri.ts";
export {
  cardinality,
  exactlyOne,
  optional,
  oneOrMore,
  zeroOrMore,
} from "./cardinality.ts";
export { range } from "./range.ts";
export { defineShape } from "./define-shape.ts";
export type { DefineShape } from "./define-shape.ts";
