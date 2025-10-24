// Resource types - Core type definitions for resource layer

import type { OntoClass, OntoIRI, OntoProperty } from "../onto/types.js";

/**
 * Base options for all resource types
 */
export interface ResourceBaseOptions {
  readonly property?: OntoIRI | OntoProperty;
  readonly description?: string;
}

/**
 * Resource schema kinds
 */
export type ResourceKind =
  | "String"
  | "Number"
  | "Boolean"
  | "Array"
  | "Object"
  | "Ref"
  | "Literal"
  | "Optional";

/**
 * Base resource schema
 */
export interface ResourceSchema {
  readonly kind: ResourceKind;
  readonly options?: Record<string, unknown>;
  readonly property?: OntoIRI | OntoProperty;
}

/**
 * String resource schema
 */
export interface StringSchema extends ResourceSchema {
  readonly kind: "String";
  readonly options?: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
    readonly format?: "email" | "uri" | "date-time" | "date" | "time" | "uuid";
    readonly required?: boolean;
    readonly optional?: boolean;
  };
}

/**
 * Number resource schema
 */
export interface NumberSchema extends ResourceSchema {
  readonly kind: "Number";
  readonly options?: {
    readonly minimum?: number;
    readonly maximum?: number;
    readonly exclusiveMinimum?: number;
    readonly exclusiveMaximum?: number;
    readonly multipleOf?: number;
    readonly required?: boolean;
    readonly optional?: boolean;
  };
}

/**
 * Boolean resource schema
 */
export interface BooleanSchema extends ResourceSchema {
  readonly kind: "Boolean";
  readonly options?: {
    readonly required?: boolean;
    readonly optional?: boolean;
  };
}

/**
 * Array resource schema
 */
export interface ArraySchema extends ResourceSchema {
  readonly kind: "Array";
  readonly items: AnyResourceSchema;
  readonly options?: {
    readonly minItems?: number;
    readonly maxItems?: number;
    readonly uniqueItems?: boolean;
    readonly required?: boolean;
    readonly optional?: boolean;
  };
}

/**
 * Object resource schema
 */
export interface ObjectSchema extends ResourceSchema {
  readonly kind: "Object";
  readonly properties: Record<string, AnyResourceSchema>;
  readonly options?: {
    readonly class?: OntoIRI | OntoClass;
    readonly additionalProperties?: boolean;
  };
}

/**
 * Reference (IRI) resource schema
 */
export interface RefSchema extends ResourceSchema {
  readonly kind: "Ref";
  readonly target: OntoIRI | OntoClass | ObjectSchema;
  readonly options?: {
    readonly required?: boolean;
    readonly optional?: boolean;
  };
}

/**
 * Literal (constant) resource schema
 */
export interface LiteralSchema<T = unknown> extends ResourceSchema {
  readonly kind: "Literal";
  readonly value: T;
}

/**
 * Optional wrapper schema
 */
export interface OptionalSchema extends ResourceSchema {
  readonly kind: "Optional";
  readonly schema: AnyResourceSchema;
}

/**
 * Union of all resource schema types
 */
export type AnyResourceSchema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ArraySchema
  | ObjectSchema
  | RefSchema
  | LiteralSchema
  | OptionalSchema;

/**
 * Resource metadata
 */
export interface ResourceMetadata {
  readonly class?: OntoIRI | OntoClass;
  readonly properties: Record<string, {
    readonly property?: OntoIRI | OntoProperty;
    readonly required: boolean;
  }>;
}

/**
 * Extract metadata from resource schema
 */
export function extractMetadata(schema: AnyResourceSchema): ResourceMetadata {
  if (schema.kind === "Object") {
    const properties: Record<string, { property?: OntoIRI | OntoProperty; required: boolean }> = {};
    
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const isOptional = 
        propSchema.kind === "Optional" ||
        (propSchema.options && "optional" in propSchema.options && propSchema.options.optional === true);
      
      const isRequired =
        propSchema.options && "required" in propSchema.options && propSchema.options.required === true;
      
      properties[key] = {
        ...(propSchema.property !== undefined && { property: propSchema.property }),
        required: isRequired || !isOptional,
      };
    }
    
    return {
      ...(schema.options?.class !== undefined && { class: schema.options.class }),
      properties,
    };
  }
  
  return {
    properties: {},
  };
}

