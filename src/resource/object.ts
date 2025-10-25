// Resource.Object - Object/record resource schema

import type { OntoClass, OntoIRI } from "../onto/types.js";
import type { AnyResourceSchema, ObjectSchema } from "./types.js";

/**
 * Object options
 */
export interface ObjectOptions {
  readonly class?: OntoIRI | OntoClass;
  readonly additionalProperties?: boolean;
  readonly description?: string;
}

/**
 * Create an Object resource schema
 * Similar to TypeBox's Type.Object()
 */
export function ResourceObject(
  properties: Record<string, AnyResourceSchema>,
  options: ObjectOptions = {}
): ObjectSchema {
  return {
    kind: "Object",
    properties,
    options: {
      ...(options.class !== undefined && { class: options.class }),
      ...(options.additionalProperties !== undefined && {
        additionalProperties: options.additionalProperties,
      }),
    },
  };
}

// Export with name 'Object' for API consistency
export { ResourceObject as Object };

/**
 * Helper to check if a schema is an Object schema
 */
export function isObject(schema: AnyResourceSchema): schema is ObjectSchema {
  return schema.kind === "Object";
}
