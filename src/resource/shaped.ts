// Resource.Shaped - Integrated API combining Resource + Shape + Onto

import type { OntoClass, OntoIRI } from "../onto/types.js";
import type { ShapeNodeDef } from "../shape/types.js";
import { ResourceObject } from "./object.js";
import type { AnyResourceSchema, ObjectSchema } from "./types.js";

/**
 * Property definition for shaped resource
 */
export interface ShapedPropertyDef {
  readonly schema: AnyResourceSchema;
  readonly shapeConstraints?: {
    readonly minCount?: number;
    readonly maxCount?: number;
    readonly pattern?: string;
    readonly minInclusive?: number;
    readonly maxInclusive?: number;
  };
}

/**
 * Options for shaped resource
 */
export interface ShapedOptions {
  readonly class: OntoIRI | OntoClass;
  readonly properties: Record<string, AnyResourceSchema>;
  readonly shape?: {
    readonly closed?: boolean;
    readonly additionalConstraints?: Record<string, unknown>;
  };
  readonly description?: string;
}

/**
 * Shaped resource combining schema + shape constraints
 */
export interface ShapedResource {
  readonly resource: ObjectSchema;
  readonly shape?: ShapeNodeDef;
}

/**
 * Create a shaped resource with integrated schema and shape constraints
 * Combines Resource layer (data structure) with Shape layer (SHACL constraints)
 *
 * @example
 * ```ts
 * const Person = Resource.Shaped({
 *   class: foaf("Person"),
 *
 *   properties: {
 *     name: Resource.String({
 *       property: foaf("name"),
 *       required: true,
 *       minLength: 1
 *     }),
 *
 *     email: Resource.String({
 *       property: foaf("mbox"),
 *       format: "email",
 *       optional: true
 *     })
 *   },
 *
 *   shape: {
 *     closed: true
 *   }
 * })
 * ```
 */
export function Shaped(options: ShapedOptions): ShapedResource {
  // Create resource schema
  const resource = ResourceObject(options.properties, {
    class: options.class,
    additionalProperties: options.shape?.closed === false,
  });

  // Shape generation can be added later if needed
  // For now, just return the resource schema

  return {
    resource,
    // TODO: Generate shape from options
  };
}
