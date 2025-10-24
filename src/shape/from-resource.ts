// Shape.fromResource - Generate SHACL shape from Resource schema

import { getClassIRI, isClass } from "../onto/class.js";
import { isProperty, getPropertyIRI } from "../onto/property.js";
import type { OntoIRI } from "../onto/types.js";
import type { ObjectSchema, RefSchema } from "../resource/types.js";
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
    
    // Generate property shape - base options
    let propShapeOpts: Partial<ShapePropertyDef> = {
      path,
    };
    
    // Set cardinality
    if (options.strict) {
      const minCount = (isRequired || !isOptional) ? 1 : 0;
      propShapeOpts = { ...propShapeOpts, minCount };
    }
    
    // Add type-specific constraints
    if (propSchema.kind === "String" && propSchema.options) {
      const opts = { ...propShapeOpts };
      if (propSchema.options.minLength !== undefined) {
        opts.minLength = propSchema.options.minLength;
      }
      if (propSchema.options.maxLength !== undefined) {
        opts.maxLength = propSchema.options.maxLength;
      }
      if (propSchema.options.pattern !== undefined) {
        opts.pattern = propSchema.options.pattern;
      }
      property[key] = opts as ShapePropertyDef;
      continue;
    }
    
    if (propSchema.kind === "Number" && propSchema.options) {
      const opts = { ...propShapeOpts };
      if (propSchema.options.minimum !== undefined) {
        opts.minInclusive = propSchema.options.minimum;
      }
      if (propSchema.options.maximum !== undefined) {
        opts.maxInclusive = propSchema.options.maximum;
      }
      if (propSchema.options.exclusiveMinimum !== undefined) {
        opts.minExclusive = propSchema.options.exclusiveMinimum;
      }
      if (propSchema.options.exclusiveMaximum !== undefined) {
        opts.maxExclusive = propSchema.options.exclusiveMaximum;
      }
      property[key] = opts as ShapePropertyDef;
      continue;
    }
    
    if (propSchema.kind === "Ref") {
      // Reference to another class
      const refSchema = propSchema as RefSchema;
      const opts = { ...propShapeOpts };
      if (typeof refSchema.target === "object" && "kind" in refSchema.target) {
        if (refSchema.target.kind === "Class") {
          opts.class = getClassIRI(refSchema.target);
        }
      } else {
        opts.class = refSchema.target;
      }
      property[key] = opts as ShapePropertyDef;
      continue;
    }
    
    property[key] = propShapeOpts as ShapePropertyDef;
  }
  
  return {
    targetClass,
    property,
    ...(options.closed !== undefined && { closed: options.closed }),
    ...(ignoredProperties.length > 0 && { ignoredProperties }),
  };
}

