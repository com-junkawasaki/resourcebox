// @gftdcojp/resourcebox - Unified export
// TypeBox-inspired RDF Resource type builder with SHACL validation and OWL ontology support

// ============================================================================
// Onto - Ontology layer (OWL/RDFS)
// ============================================================================

import * as OntoNS from "./onto/index.js";

export const Onto = {
  // Namespace
  Namespace: OntoNS.Namespace,
  RDF: OntoNS.RDF,
  RDFS: OntoNS.RDFS,
  OWL: OntoNS.OWL,
  XSD: OntoNS.XSD,
  FOAF: OntoNS.FOAF,

  // Class
  Class: OntoNS.Class,

  // Property
  Property: OntoNS.Property,

  // Datatype
  Datatype: {
    String: OntoNS.String,
    Boolean: OntoNS.Boolean,
    Decimal: OntoNS.Decimal,
    Float: OntoNS.Float,
    Double: OntoNS.Double,
    Integer: OntoNS.Integer,
    PositiveInteger: OntoNS.PositiveInteger,
    NegativeInteger: OntoNS.NegativeInteger,
    NonPositiveInteger: OntoNS.NonPositiveInteger,
    NonNegativeInteger: OntoNS.NonNegativeInteger,
    Long: OntoNS.Long,
    Int: OntoNS.Int,
    Short: OntoNS.Short,
    Byte: OntoNS.Byte,
    UnsignedLong: OntoNS.UnsignedLong,
    UnsignedInt: OntoNS.UnsignedInt,
    UnsignedShort: OntoNS.UnsignedShort,
    UnsignedByte: OntoNS.UnsignedByte,
    DateTime: OntoNS.DateTime,
    DateTimeStamp: OntoNS.DateTimeStamp,
    Date: OntoNS.Date,
    Time: OntoNS.Time,
    Duration: OntoNS.Duration,
    YearMonthDuration: OntoNS.YearMonthDuration,
    DayTimeDuration: OntoNS.DayTimeDuration,
    GYear: OntoNS.GYear,
    GMonth: OntoNS.GMonth,
    GDay: OntoNS.GDay,
    GYearMonth: OntoNS.GYearMonth,
    GMonthDay: OntoNS.GMonthDay,
    NormalizedString: OntoNS.NormalizedString,
    Token: OntoNS.Token,
    Language: OntoNS.Language,
    Name: OntoNS.Name,
    NCName: OntoNS.NCName,
    NMTOKEN: OntoNS.NMTOKEN,
    AnyURI: OntoNS.AnyURI,
    Base64Binary: OntoNS.Base64Binary,
    HexBinary: OntoNS.HexBinary,
  },

  // Helpers
  iri: OntoNS.iri,
  getIRI: OntoNS.getIRI,
  isClass: OntoNS.isClass,
  isProperty: OntoNS.isProperty,
  isDatatype: OntoNS.isDatatype,
  getClassIRI: OntoNS.getClassIRI,
  getPropertyIRI: OntoNS.getPropertyIRI,
  getDatatypeIRI: OntoNS.getDatatypeIRI,

  // OWL Class Expressions & Ontology Container & JSON-LD
  Expressions: OntoNS.Expressions,
  OntologyContainer: OntoNS.OntologyContainer,
  toJsonLd: OntoNS.toJsonLd,

  // Inference (RDFS/OWL Lite reasoning)
  createInferenceContext: OntoNS.createInferenceContext,
  isSubClassOf: OntoNS.isSubClassOf,
  areEquivalentClasses: OntoNS.areEquivalentClasses,
  getInverseProperty: OntoNS.getInverseProperty,
  getAllSuperClasses: OntoNS.getAllSuperClasses,
};

// Export Onto types
export type {
  OntoIRI,
  NamespaceFunction,
  OntoClass,
  OntoProperty,
  OntoDatatype,
  NamespaceOptions,
  ClassOptions,
  PropertyOptions,
  InferenceContext,
} from "./onto/index.js";

// Top-level re-export for backward compatibility with README examples
export { createInferenceContext } from "./onto/inference.js";

// ==========================================================================
// Resource - Resource layer (data structure definition)
// ==========================================================================

import * as ResourceNS from "./resource/index.js";

export const Resource = ResourceNS.Resource;

// Export Resource types
export type {
  ResourceSchema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  ArraySchema,
  ObjectSchema,
  RefSchema,
  LiteralSchema,
  OptionalSchema,
  AnyResourceSchema,
  ResourceMetadata,
  StringOptions,
  NumberOptions,
  BooleanOptions,
  ArrayOptions,
  ObjectOptions,
  RefOptions,
  ValidationResult,
  ValidationError,
  ContextValue,
  ContextMap,
  JsonLdContext,
  ContextOptions,
} from "./resource/index.js";

// Export Resource.Static type helper
export type { Static } from "./resource/static.js";

// Export Shaped types
export type { ShapedOptions, ShapedResource } from "./resource/shaped.js";

// ============================================================================
// Shape - SHACL shape layer
// ============================================================================

import * as ShapeNS from "./shape/index.js";

export const Shape = {
  // Define
  Define: ShapeNS.Define,
  Property: ShapeNS.Property,

  // From Resource
  fromResource: ShapeNS.fromResource,

  // Validate
  validate: ShapeNS.validate,
  check: ShapeNS.check,

  // JSON-LD export
  toJsonLd: ShapeNS.toJsonLd,
};

// Export Shape types
export type {
  ShapePropertyDef,
  ShapeNodeDef,
  ShapeValidationResult,
  ShapeViolation,
  DefineOptions,
  PropertyOptions as ShapePropertyOptions,
  FromResourceOptions,
} from "./shape/index.js";

// ==========================================================================
// Internal - Process / RPC integrations
// ==========================================================================

import * as ProcessRpcNS from "./_internal/process/rpc/index.js";

export const Process = {
  Rpc: ProcessRpcNS,
};
