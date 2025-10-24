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
    datatype: options.datatype,
    class: options.class,
    minCount: options.minCount,
    maxCount: options.maxCount,
    minLength: options.minLength,
    maxLength: options.maxLength,
    pattern: options.pattern,
    minInclusive: options.minInclusive,
    maxInclusive: options.maxInclusive,
    minExclusive: options.minExclusive,
    maxExclusive: options.maxExclusive,
    description: options.description,
  };
}

