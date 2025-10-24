// Resource.Array - Array/collection resource schema

import type { OntoIRI, OntoProperty } from "../onto/types.js";
import type { ArraySchema, AnyResourceSchema } from "./types.js";

/**
 * Array options
 */
export interface ArrayOptions {
  readonly property?: OntoIRI | OntoProperty;
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly description?: string;
}

/**
 * Create an Array resource schema
 * 
 * @example
 * ```ts
 * Resource.Array(Resource.String())
 * Resource.Array(Resource.Ref(Person), { minItems: 1 })
 * Resource.Array(Resource.String(), { property: ex("tags"), uniqueItems: true })
 * ```
 */
export function Array(
  items: AnyResourceSchema,
  options: ArrayOptions = {}
): ArraySchema {
  return {
    kind: "Array",
    items,
    property: options.property,
    options: {
      minItems: options.minItems,
      maxItems: options.maxItems,
      uniqueItems: options.uniqueItems,
      required: options.required,
      optional: options.optional,
    },
  };
}

