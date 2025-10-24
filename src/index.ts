// @gftdcojp/shapebox - Unified export
// TypeBox-based RDF/OWL/SHACL-lite shape validation library

// ============================================================================
// Core exports - Shape definition and JSON-LD context generation
// ============================================================================

// Types
export type {
  IRI,
  Cardinality,
  Range,
  PropertyMeta,
  ShapeDefinition,
  Shape,
  ShapeSchemaType,
  ShapeDataType,
} from "./core/types/index.ts";

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
} from "./core/types/index.ts";

// DSL API
export {
  iri,
  classIri,
  propertyIri,
  datatypeIri,
  cardinality,
  exactlyOne,
  optional,
  oneOrMore,
  zeroOrMore,
  range,
  defineShape,
} from "./core/dsl/index.ts";

export type { DefineShape } from "./core/dsl/index.ts";

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
} from "./core/typecheck/index.ts";

export {
  validateRangeExclusivityRuntime,
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "./core/typecheck/index.ts";

// Context generation
export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./core/context/index.ts";

export { buildContext, mergeContexts, extractNamespacePrefixes } from "./core/context/index.ts";

// ============================================================================
// Validate exports - Runtime validation
// ============================================================================

// Report types
export type {
  ValidationResult,
  ValidationError,
  ShapeReport,
  ShapeViolation,
  ViolationCode,
} from "./validate/report/index.ts";

// Structure validation
export { validateStruct, validateStructBatch } from "./validate/struct/index.ts";

// Shape validation
export { validateShape, validateShapeBatch } from "./validate/shape/index.ts";

// Helper functions (for advanced usage)
export { checkCardinality, checkRange, checkType } from "./validate/shape/index.ts";
