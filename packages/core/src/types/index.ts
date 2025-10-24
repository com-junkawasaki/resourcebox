// DAG: core-types
// Type definitions export index

export type { IRI } from "./iri.ts";
export { isIRI, getIRIPrefix, getIRILocalName } from "./iri.ts";

export type { Cardinality } from "./cardinality.ts";
export {
  validateCardinalityStructure,
  satisfiesCardinality,
  CARDINALITY_PATTERNS,
} from "./cardinality.ts";

export type { Range } from "./range.ts";
export {
  isDatatypeRange,
  isShapeRange,
  XSD_DATATYPES,
  RDF_DATATYPES,
} from "./range.ts";

export type { PropertyMeta } from "./property.ts";
export { validatePropertyMeta } from "./property.ts";

export type { ShapeDefinition, Shape, ShapeSchemaType, ShapeDataType } from "./shape.ts";

