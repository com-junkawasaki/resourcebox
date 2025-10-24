// Onto.Datatype - XSD and RDF datatype definitions

import type { OntoDatatype, OntoIRI } from "./types.js";
import { XSD } from "./namespace.js";

/**
 * Create a custom datatype
 */
export function Datatype(iri: OntoIRI, label?: string): OntoDatatype {
  return {
    kind: "Datatype",
    iri,
    ...(label !== undefined && { label }),
  };
}

/**
 * Common XSD datatypes
 * https://www.w3.org/TR/xmlschema-2/
 */
export const String = Datatype(XSD("string"), "string");
export const Boolean = Datatype(XSD("boolean"), "boolean");
export const Decimal = Datatype(XSD("decimal"), "decimal");
export const Float = Datatype(XSD("float"), "float");
export const Double = Datatype(XSD("double"), "double");
export const Integer = Datatype(XSD("integer"), "integer");
export const PositiveInteger = Datatype(XSD("positiveInteger"), "positiveInteger");
export const NegativeInteger = Datatype(XSD("negativeInteger"), "negativeInteger");
export const NonPositiveInteger = Datatype(XSD("nonPositiveInteger"), "nonPositiveInteger");
export const NonNegativeInteger = Datatype(XSD("nonNegativeInteger"), "nonNegativeInteger");
export const Long = Datatype(XSD("long"), "long");
export const Int = Datatype(XSD("int"), "int");
export const Short = Datatype(XSD("short"), "short");
export const Byte = Datatype(XSD("byte"), "byte");
export const UnsignedLong = Datatype(XSD("unsignedLong"), "unsignedLong");
export const UnsignedInt = Datatype(XSD("unsignedInt"), "unsignedInt");
export const UnsignedShort = Datatype(XSD("unsignedShort"), "unsignedShort");
export const UnsignedByte = Datatype(XSD("unsignedByte"), "unsignedByte");

// Date and time types
export const DateTime = Datatype(XSD("dateTime"), "dateTime");
export const DateTimeStamp = Datatype(XSD("dateTimeStamp"), "dateTimeStamp");
export const Date = Datatype(XSD("date"), "date");
export const Time = Datatype(XSD("time"), "time");
export const Duration = Datatype(XSD("duration"), "duration");
export const YearMonthDuration = Datatype(XSD("yearMonthDuration"), "yearMonthDuration");
export const DayTimeDuration = Datatype(XSD("dayTimeDuration"), "dayTimeDuration");
export const GYear = Datatype(XSD("gYear"), "gYear");
export const GMonth = Datatype(XSD("gMonth"), "gMonth");
export const GDay = Datatype(XSD("gDay"), "gDay");
export const GYearMonth = Datatype(XSD("gYearMonth"), "gYearMonth");
export const GMonthDay = Datatype(XSD("gMonthDay"), "gMonthDay");

// String types
export const NormalizedString = Datatype(XSD("normalizedString"), "normalizedString");
export const Token = Datatype(XSD("token"), "token");
export const Language = Datatype(XSD("language"), "language");
export const Name = Datatype(XSD("Name"), "Name");
export const NCName = Datatype(XSD("NCName"), "NCName");
export const NMTOKEN = Datatype(XSD("NMTOKEN"), "NMTOKEN");

// Other types
export const AnyURI = Datatype(XSD("anyURI"), "anyURI");
export const Base64Binary = Datatype(XSD("base64Binary"), "base64Binary");
export const HexBinary = Datatype(XSD("hexBinary"), "hexBinary");

/**
 * Helper to check if an entity is an OntoDatatype
 */
export function isDatatype(entity: unknown): entity is OntoDatatype {
  return (
    typeof entity === "object" &&
    entity !== null &&
    "kind" in entity &&
    entity.kind === "Datatype"
  );
}

/**
 * Helper to get datatype IRI from OntoDatatype or OntoIRI
 */
export function getDatatypeIRI(datatypeEntity: OntoDatatype | OntoIRI): OntoIRI {
  return typeof datatypeEntity === "string" ? datatypeEntity : datatypeEntity.iri;
}

