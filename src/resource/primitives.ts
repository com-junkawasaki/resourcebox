// Resource primitives - String, Number, Boolean

import type { OntoIRI, OntoProperty } from "../onto/types.js";
import type { StringSchema, NumberSchema, BooleanSchema } from "./types.js";

/**
 * String options
 */
export interface StringOptions {
  readonly property?: OntoIRI | OntoProperty;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly format?: "email" | "uri" | "date-time" | "date" | "time" | "uuid";
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly description?: string;
}

/**
 * Create a String resource schema
 * 
 * @example
 * ```ts
 * Resource.String({ minLength: 1, maxLength: 100 })
 * Resource.String({ property: foaf("name"), required: true })
 * Resource.String({ format: "email", optional: true })
 * ```
 */
export function String(options: StringOptions = {}): StringSchema {
  return {
    kind: "String",
    property: options.property,
    options: {
      minLength: options.minLength,
      maxLength: options.maxLength,
      pattern: options.pattern,
      format: options.format,
      required: options.required,
      optional: options.optional,
    },
  };
}

/**
 * Number options
 */
export interface NumberOptions {
  readonly property?: OntoIRI | OntoProperty;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly exclusiveMinimum?: number;
  readonly exclusiveMaximum?: number;
  readonly multipleOf?: number;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly description?: string;
}

/**
 * Create a Number resource schema
 * 
 * @example
 * ```ts
 * Resource.Number({ minimum: 0, maximum: 150 })
 * Resource.Number({ property: foaf("age"), required: true })
 * ```
 */
export function Number(options: NumberOptions = {}): NumberSchema {
  return {
    kind: "Number",
    property: options.property,
    options: {
      minimum: options.minimum,
      maximum: options.maximum,
      exclusiveMinimum: options.exclusiveMinimum,
      exclusiveMaximum: options.exclusiveMaximum,
      multipleOf: options.multipleOf,
      required: options.required,
      optional: options.optional,
    },
  };
}

/**
 * Boolean options
 */
export interface BooleanOptions {
  readonly property?: OntoIRI | OntoProperty;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly description?: string;
}

/**
 * Create a Boolean resource schema
 * 
 * @example
 * ```ts
 * Resource.Boolean()
 * Resource.Boolean({ property: ex("verified"), required: true })
 * ```
 */
export function Boolean(options: BooleanOptions = {}): BooleanSchema {
  return {
    kind: "Boolean",
    property: options.property,
    options: {
      required: options.required,
      optional: options.optional,
    },
  };
}

