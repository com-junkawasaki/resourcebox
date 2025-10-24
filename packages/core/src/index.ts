// DAG: core (main export)
// @gftdcojp/shapebox-core main entry point

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
} from "./types/index.ts";

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
} from "./types/index.ts";

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
} from "./dsl/index.ts";

export type { DefineShape } from "./dsl/index.ts";

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
} from "./typecheck/index.ts";

export {
  validateRangeExclusivityRuntime,
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "./typecheck/index.ts";

// Context generation
export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./context/index.ts";

export { buildContext, mergeContexts, extractNamespacePrefixes } from "./context/index.ts";

