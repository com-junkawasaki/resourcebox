// DAG: core-types
// Type definitions export index

export type { IRI } from "./iri.js";
export { isIRI, getIRIPrefix, getIRILocalName } from "./iri.js";

export type { Cardinality } from "./cardinality.js";
export {
  validateCardinalityStructure,
  satisfiesCardinality,
  CARDINALITY_PATTERNS,
} from "./cardinality.js";

export type { Range } from "./range.js";
export {
  isDatatypeRange,
  isShapeRange,
  XSD_DATATYPES,
  RDF_DATATYPES,
} from "./range.js";

export type { PropertyMeta } from "./property.js";
export { validatePropertyMeta } from "./property.js";

export type { ShapeDefinition, Shape, ShapeSchemaType, ShapeDataType } from "./shape.js";
