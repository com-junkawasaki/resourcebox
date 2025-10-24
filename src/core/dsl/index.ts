// DAG: core-api
// DSL API export index

export { iri, classIri, propertyIri, datatypeIri } from "./iri.js";
export {
  cardinality,
  exactlyOne,
  optional,
  oneOrMore,
  zeroOrMore,
} from "./cardinality.js";
export { range } from "./range.js";
export { defineShape } from "./define-shape.js";
export type { DefineShape } from "./define-shape.js";
