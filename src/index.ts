// @gftdcojp/resourcebox - Unified export
// TypeBox-inspired RDF Resource type builder with SHACL validation and OWL ontology support

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
} from "./core/types/index.js";

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
} from "./core/types/index.js";

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
} from "./core/dsl/index.js";

export type { DefineShape } from "./core/dsl/index.js";

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
} from "./core/typecheck/index.js";

export {
  validateRangeExclusivityRuntime,
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "./core/typecheck/index.js";

// Context generation
export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./core/context/index.js";

export { buildContext, mergeContexts, extractNamespacePrefixes } from "./core/context/index.js";

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
} from "./validate/report/index.js";

// Structure validation
export { validateStruct, validateStructBatch } from "./validate/struct/index.js";

// Shape validation
export { validateShape, validateShapeBatch } from "./validate/shape/index.js";

// Helper functions (for advanced usage)
export { checkCardinality, checkRange, checkType } from "./validate/shape/index.js";
