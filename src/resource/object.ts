// Resource.Object - Object/record resource schema

import type { OntoClass, OntoIRI } from "../onto/types.js";
import type { ObjectSchema, AnyResourceSchema } from "./types.js";

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
 * 
 * @example
 * ```ts
 * Resource.Object({
 *   "@id": Resource.String({ format: "uri" }),
 *   "@type": Resource.Literal(["foaf:Person"]),
 *   name: Resource.String({ property: foaf("name"), required: true }),
 *   email: Resource.String({ property: foaf("mbox"), format: "email", optional: true })
 * }, {
 *   class: foaf("Person")
 * })
 * ```
 */
export function Object(
  properties: Record<string, AnyResourceSchema>,
  options: ObjectOptions = {}
): ObjectSchema {
  return {
    kind: "Object",
    properties,
    options: {
      class: options.class,
      additionalProperties: options.additionalProperties,
    },
  };
}

/**
 * Helper to check if a schema is an Object schema
 */
export function isObject(schema: AnyResourceSchema): schema is ObjectSchema {
  return schema.kind === "Object";
}

