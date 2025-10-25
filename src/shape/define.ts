// Shape.Define - Define SHACL node shapes

import type { OntoClass, OntoIRI } from "../onto/types.js";
import type { ShapeNodeDef, ShapePropertyDef } from "./types.js";

/**
 * SHACL Node Shape options
 */
export interface DefineOptions {
  readonly targetClass: OntoIRI | OntoClass;
  readonly property: Record<string, ShapePropertyDef>;
  readonly closed?: boolean;
  readonly ignoredProperties?: ReadonlyArray<OntoIRI>;
  readonly description?: string;
}

/**
 * Define a SHACL Node Shape
 * Specifies constraints for a class of resources
 *
 * @example
 * ```ts
 * const PersonShape = Shape.Define({
 *   targetClass: Person,
 *
 *   property: {
 *     name: Shape.Property({
 *       path: foaf("name"),
 *       datatype: Onto.Datatype.String,
 *       minCount: 1,
 *       maxCount: 1
 *     }),
 *
 *     email: Shape.Property({
 *       path: foaf("mbox"),
 *       datatype: Onto.Datatype.String,
 *       maxCount: 1,
 *       pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
 *     })
 *   },
 *
 *   closed: true
 * })
 * ```
 */
export function Define(options: DefineOptions): ShapeNodeDef {
  return {
    targetClass: options.targetClass,
    property: options.property,
    ...(options.closed !== undefined && { closed: options.closed }),
    ...(options.ignoredProperties !== undefined && {
      ignoredProperties: options.ignoredProperties,
    }),
    ...(options.description !== undefined && { description: options.description }),
  };
}
