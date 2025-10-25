// Resource.Array - Array/collection resource schema

import type { OntoIRI, OntoProperty } from "../onto/types.js";
import type { AnyResourceSchema, ArraySchema } from "./types.js";

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
export function ResourceArray(items: AnyResourceSchema, options: ArrayOptions = {}): ArraySchema {
  return {
    kind: "Array",
    items,
    ...(options.property !== undefined && { property: options.property }),
    options: {
      ...(options.minItems !== undefined && { minItems: options.minItems }),
      ...(options.maxItems !== undefined && { maxItems: options.maxItems }),
      ...(options.uniqueItems !== undefined && { uniqueItems: options.uniqueItems }),
      ...(options.required !== undefined && { required: options.required }),
      ...(options.optional !== undefined && { optional: options.optional }),
    },
  };
}
