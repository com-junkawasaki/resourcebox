// Resource.Ref - IRI reference to other resources

import type { OntoClass, OntoIRI } from "../onto/types.js";
import type { ObjectSchema, RefSchema } from "./types.js";

/**
 * Ref options
 */
export interface RefOptions {
  readonly property?: OntoIRI;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly description?: string;
}

/**
 * Create a Ref (IRI reference) resource schema
 * References another resource by IRI
 * 
 * @example
 * ```ts
 * Resource.Ref(Person)
 * Resource.Ref(foaf("Person"))
 * Resource.Ref("ex:Person", { property: ex("knows") })
 * ```
 */
export function Ref(
  target: OntoIRI | OntoClass | ObjectSchema,
  options: RefOptions = {}
): RefSchema {
  return {
    kind: "Ref",
    target,
    property: options.property,
    options: {
      required: options.required,
      optional: options.optional,
    },
  };
}

