// Resource.Optional - Mark schema as optional

import type { AnyResourceSchema, OptionalSchema } from "./types.js";

/**
 * Mark a resource schema as optional
 * Alternative to using { optional: true } in options
 * 
 * @example
 * ```ts
 * Resource.Optional(Resource.String())
 * Resource.Optional(Resource.Number({ minimum: 0 }))
 * ```
 */
export function Optional(schema: AnyResourceSchema): OptionalSchema {
  return {
    kind: "Optional",
    schema,
  };
}

/**
 * Check if a schema is optional
 */
export function isOptional(schema: AnyResourceSchema): boolean {
  if (schema.kind === "Optional") {
    return true;
  }
  if (schema.options && "optional" in schema.options && schema.options.optional === true) {
    return true;
  }
  return false;
}

/**
 * Check if a schema is required
 */
export function isRequired(schema: AnyResourceSchema): boolean {
  if (schema.kind === "Optional") {
    return false;
  }
  if (schema.options && "required" in schema.options && schema.options.required === true) {
    return true;
  }
  if (schema.options && "optional" in schema.options && schema.options.optional === true) {
    return false;
  }
  // Default: required unless marked optional
  return true;
}

