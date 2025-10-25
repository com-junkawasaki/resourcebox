// Shape.Property - Define SHACL property shapes

import type { OntoClass, OntoDatatype, OntoIRI, OntoProperty } from "../onto/types.js";
import type { ShapePropertyDef } from "./types.js";

/**
 * SHACL Property Shape options
 */
export interface PropertyOptions {
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
  readonly description?: string;
}

/**
 * Define a SHACL Property Shape
 * Specifies constraints for a property in a Node Shape
 *
 * @example
 * ```ts
 * Shape.Property({
 *   path: foaf("name"),
 *   datatype: Onto.Datatype.String,
 *   minCount: 1,
 *   maxCount: 1,
 *   pattern: "^[A-Z]"
 * })
 * ```
 */
export function Property(options: PropertyOptions): ShapePropertyDef {
  return {
    path: options.path,
    ...(options.datatype !== undefined && { datatype: options.datatype }),
    ...(options.class !== undefined && { class: options.class }),
    ...(options.minCount !== undefined && { minCount: options.minCount }),
    ...(options.maxCount !== undefined && { maxCount: options.maxCount }),
    ...(options.minLength !== undefined && { minLength: options.minLength }),
    ...(options.maxLength !== undefined && { maxLength: options.maxLength }),
    ...(options.pattern !== undefined && { pattern: options.pattern }),
    ...(options.minInclusive !== undefined && { minInclusive: options.minInclusive }),
    ...(options.maxInclusive !== undefined && { maxInclusive: options.maxInclusive }),
    ...(options.minExclusive !== undefined && { minExclusive: options.minExclusive }),
    ...(options.maxExclusive !== undefined && { maxExclusive: options.maxExclusive }),
    ...(options.description !== undefined && { description: options.description }),
  };
}
