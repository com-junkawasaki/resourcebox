// DAG: core (main export)
// @gftdcojp/resourcebox-core main entry point

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
} from "./dsl/index.js";

export type { DefineShape } from "./dsl/index.js";

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

// Context generation
export type {
  JsonLdTermDefinition,
  JsonLdContextValue,
  JsonLdContextMap,
  JsonLdContext,
  BuildContextOptions,
} from "./context/index.js";

export { buildContext, mergeContexts, extractNamespacePrefixes } from "./context/index.js";
