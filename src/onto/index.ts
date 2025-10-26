// Onto - Ontology layer (OWL/RDFS) API

// Types
export type {
  OntoIRI,
  NamespaceFunction,
  OntoClass,
  OntoProperty,
  OntoDatatype,
  Annotation,
  Restriction,
  ClassExpression,
  Ontology,
} from "./types.js";

export { iri, getIRI } from "./types.js";

// Expressions & Ontology container & JSON-LD export
export * as Expressions from "./expressions.js";
export { Ontology as OntologyContainer } from "./ontology.js";
export { toJsonLd } from "./jsonld.js";

// Namespace
export { Namespace, RDF, RDFS, OWL, XSD, FOAF } from "./namespace.js";
export type { NamespaceOptions } from "./namespace.js";

// Class
export { Class, isClass, getClassIRI } from "./class.js";
export type { ClassOptions } from "./class.js";

// Property
export { Property, isProperty, getPropertyIRI } from "./property.js";
export type { PropertyOptions } from "./property.js";

// Datatype
export {
  Datatype,
  isDatatype,
  getDatatypeIRI,
  // XSD types
  String,
  Boolean,
  Decimal,
  Float,
  Double,
  Integer,
  PositiveInteger,
  NegativeInteger,
  NonPositiveInteger,
  NonNegativeInteger,
  Long,
  Int,
  Short,
  Byte,
  UnsignedLong,
  UnsignedInt,
  UnsignedShort,
  UnsignedByte,
  DateTime,
  DateTimeStamp,
  Date,
  Time,
  Duration,
  YearMonthDuration,
  DayTimeDuration,
  GYear,
  GMonth,
  GDay,
  GYearMonth,
  GMonthDay,
  NormalizedString,
  Token,
  Language,
  Name,
  NCName,
  NMTOKEN,
  AnyURI,
  Base64Binary,
  HexBinary,
} from "./datatype.js";

// Inference (RDFS/OWL Lite reasoning)
export {
  createInferenceContext,
  isSubClassOf,
  areEquivalentClasses,
  getInverseProperty,
  getAllSuperClasses,
} from "./inference.js";
export type { InferenceContext } from "./inference.js";
