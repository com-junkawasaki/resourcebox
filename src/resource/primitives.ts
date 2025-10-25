// Resource primitives - String, Number, Boolean

import type { BooleanSchema, NumberSchema, StringSchema } from "./types.js";
import type { OntoIRI, OntoProperty } from "../onto/types.js";

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
export function ResourceString(options: StringOptions = {}): StringSchema {
  return {
    kind: "String",
    ...(options.property !== undefined && { property: options.property }),
    options: {
      ...(options.minLength !== undefined && { minLength: options.minLength }),
      ...(options.maxLength !== undefined && { maxLength: options.maxLength }),
      ...(options.pattern !== undefined && { pattern: options.pattern }),
      ...(options.format !== undefined && { format: options.format }),
      ...(options.required !== undefined && { required: options.required }),
      ...(options.optional !== undefined && { optional: options.optional }),
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
export function ResourceNumber(options: NumberOptions = {}): NumberSchema {
  return {
    kind: "Number",
    ...(options.property !== undefined && { property: options.property }),
    options: {
      ...(options.minimum !== undefined && { minimum: options.minimum }),
      ...(options.maximum !== undefined && { maximum: options.maximum }),
      ...(options.exclusiveMinimum !== undefined && { exclusiveMinimum: options.exclusiveMinimum }),
      ...(options.exclusiveMaximum !== undefined && { exclusiveMaximum: options.exclusiveMaximum }),
      ...(options.multipleOf !== undefined && { multipleOf: options.multipleOf }),
      ...(options.required !== undefined && { required: options.required }),
      ...(options.optional !== undefined && { optional: options.optional }),
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
export function ResourceBoolean(options: BooleanOptions = {}): BooleanSchema {
  return {
    kind: "Boolean",
    ...(options.property !== undefined && { property: options.property }),
    options: {
      ...(options.required !== undefined && { required: options.required }),
      ...(options.optional !== undefined && { optional: options.optional }),
    },
  };
}

// Note: Named functions are exported directly; `resource/index.ts` re-exports them under Resource.String/Number/Boolean.
