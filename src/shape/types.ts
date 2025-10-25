// Shape types - Core type definitions for SHACL shape layer

import type { OntoClass, OntoDatatype, OntoIRI, OntoProperty } from "../onto/types.js";

/**
 * SHACL Property Shape definition
 */
export interface ShapePropertyDef {
  readonly path: OntoIRI | OntoProperty;
  readonly datatype?: OntoIRI | OntoDatatype;
  readonly class?: OntoIRI | OntoClass;
  readonly minCount?: number;
  readonly maxCount?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly minInclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly maxExclusive?: number;
  // SHACL-lite extensions
  readonly nodeKind?: "IRI" | "Literal" | "BlankNode";
  readonly in?: ReadonlyArray<string | number | boolean | OntoIRI>;
  readonly hasValue?: string | number | boolean | OntoIRI;
  readonly propertyPath?: OntoIRI; // simple IRI path only (no complex paths)
  readonly or?: ReadonlyArray<ShapePropertyDef>;
  readonly xone?: ReadonlyArray<ShapePropertyDef>;
  readonly description?: string;
}

/**
 * SHACL Node Shape definition
 */
export interface ShapeNodeDef {
  readonly targetClass: OntoIRI | OntoClass;
  readonly property: Record<string, ShapePropertyDef>;
  readonly closed?: boolean;
  readonly ignoredProperties?: ReadonlyArray<OntoIRI>;
  readonly description?: string;
}

/**
 * Shape validation result
 */
export interface ShapeValidationResult {
  readonly ok: boolean;
  readonly violations?: ReadonlyArray<ShapeViolation>;
}

/**
 * Shape validation violation
 */
export interface ShapeViolation {
  readonly path: string;
  readonly message: string;
  readonly value?: unknown;
  readonly constraint: string;
}
