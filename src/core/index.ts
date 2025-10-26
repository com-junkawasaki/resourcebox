// DAG: core (main export)
// @gftdcojp/resourcebox-core internal types (not for public API)
// The core layer is now internal-only; public API uses Onto/Resource/Shape

// Internal types (may be referenced by Resource/Shape layers)
export type {
  IRI,
  Cardinality,
  Range,
  PropertyMeta,
  ShapeDefinition,
  Shape,
  ShapeSchemaType,
  ShapeDataType,
} from "./types/index.js";

export {
  isIRI,
  getIRIPrefix,
  getIRILocalName,
  validateCardinalityStructure,
  satisfiesCardinality,
  CARDINALITY_PATTERNS,
  isDatatypeRange,
  isShapeRange,
  XSD_DATATYPES,
  RDF_DATATYPES,
  validatePropertyMeta,
} from "./types/index.js";

// Type-level checks (for advanced usage)
export type {
  ValidateCardinalityOptional,
  ValidateAllCardinalityOptional,
  CardinalityOptionalError,
  ValidateRangeExclusivity,
  ValidateExtendsCircular,
  ExtendsCircularError,
  ValidatePropsSchemaConsistency,
  ExtraPropsKeys,
  PropsSchemaConsistencyError,
} from "./typecheck/index.js";

export {
  validateRangeExclusivityRuntime,
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "./typecheck/index.js";
