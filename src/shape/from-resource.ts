// Shape.fromResource - Generate SHACL shape from Resource schema

import { getClassIRI, isClass } from "../onto/class.js";
import { getDatatypeIRI, isDatatype } from "../onto/datatype.js";
import { getPropertyIRI, isProperty } from "../onto/property.js";
import type { OntoIRI } from "../onto/types.js";
import type { ObjectSchema } from "../resource/types.js";
import type { ShapeNodeDef, ShapePropertyDef } from "./types.js";

/**
 * Options for shape generation from resource
 */
export interface FromResourceOptions {
  readonly strict?: boolean;  // Strict cardinality constraints
  readonly closed?: boolean;  // Closed shape
}

/**
 * Generate SHACL shape from Resource schema
 * Automatically infers constraints from resource definition
 * 
 * @example
 * ```ts
 * const Person = Resource.Object({
 *   name: Resource.String({ property: foaf("name"), required: true }),
 *   age: Resource.Number({ property: foaf("age"), minimum: 0, optional: true })
 * }, {
 *   class: foaf("Person")
 * })
 * 
 * const PersonShape = Shape.fromResource(Person, { strict: true })
 * ```
 */
export function fromResource(
  schema: ObjectSchema,
  options: FromResourceOptions = {}
): ShapeNodeDef {
  // Extract target class
  if (!schema.options?.class) {
    throw new Error("Cannot generate shape: resource schema must have a class");
  }
  
  const targetClass = isClass(schema.options.class)
    ? getClassIRI(schema.options.class)
    : schema.options.class;
  
  // Generate property shapes
  const property: Record<string, ShapePropertyDef> = {};
  const ignoredProperties: OntoIRI[] = [];
  
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // Skip JSON-LD reserved properties
    if (key === "@id" || key === "@type" || key === "@context") {
      continue;
    }
    
    // Skip properties without RDF property mapping
    if (!propSchema.property) {
      continue;
    }
    
    // Extract property IRI
    const path = isProperty(propSchema.property)
      ? getPropertyIRI(propSchema.property)
      : propSchema.property;
    
    // Determine required/optional
    const isOptional =
      propSchema.kind === "Optional" ||
      (propSchema.options && "optional" in propSchema.options && propSchema.options.optional === true);
    
    const isRequired =
      propSchema.options && "required" in propSchema.options && propSchema.options.required === true;
    
    // Generate property shape
    const propShape: ShapePropertyDef = {
      path,
    };
    
    // Set cardinality
    if (options.strict) {
      if (isRequired || !isOptional) {
        propShape.minCount = 1;
      } else {
        propShape.minCount = 0;
      }
    }
    
    // Add type-specific constraints
    if (propSchema.kind === "String") {
      if (propSchema.options) {
        propShape.minLength = propSchema.options.minLength;
        propShape.maxLength = propSchema.options.maxLength;
        propShape.pattern = propSchema.options.pattern;
      }
    } else if (propSchema.kind === "Number") {
      if (propSchema.options) {
        propShape.minInclusive = propSchema.options.minimum;
        propShape.maxInclusive = propSchema.options.maximum;
        propShape.minExclusive = propSchema.options.exclusiveMinimum;
        propShape.maxExclusive = propSchema.options.exclusiveMaximum;
      }
    } else if (propSchema.kind === "Ref") {
      // Reference to another class
      if (typeof propSchema.target === "object" && "kind" in propSchema.target) {
        if (propSchema.target.kind === "Class") {
          propShape.class = getClassIRI(propSchema.target);
        }
      } else {
        propShape.class = propSchema.target;
      }
    }
    
    property[key] = propShape;
  }
  
  return {
    targetClass,
    property,
    closed: options.closed ?? false,
    ignoredProperties: ignoredProperties.length > 0 ? ignoredProperties : undefined,
  };
}

