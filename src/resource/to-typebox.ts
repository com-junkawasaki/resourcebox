// Convert ResourceSchema to TypeBox TSchema

import { Type, type TSchema } from "@sinclair/typebox";
import type { AnyResourceSchema } from "./types.js";

/**
 * Convert ResourceSchema to TypeBox TSchema
 * Internal helper for validation
 */
export function toTypeBox(schema: AnyResourceSchema): TSchema {
  switch (schema.kind) {
    case "String": {
      const opts = schema.options || {};
      return Type.String({
        minLength: opts.minLength,
        maxLength: opts.maxLength,
        pattern: opts.pattern,
        format: opts.format,
      });
    }
    
    case "Number": {
      const opts = schema.options || {};
      return Type.Number({
        minimum: opts.minimum,
        maximum: opts.maximum,
        exclusiveMinimum: opts.exclusiveMinimum,
        exclusiveMaximum: opts.exclusiveMaximum,
        multipleOf: opts.multipleOf,
      });
    }
    
    case "Boolean": {
      return Type.Boolean();
    }
    
    case "Array": {
      const opts = schema.options || {};
      return Type.Array(toTypeBox(schema.items), {
        minItems: opts.minItems,
        maxItems: opts.maxItems,
        uniqueItems: opts.uniqueItems,
      });
    }
    
    case "Object": {
      const properties: Record<string, TSchema> = {};
      const required: string[] = [];
      
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        properties[key] = toTypeBox(propSchema);
        
        // Check if property is required
        const isOptional = 
          propSchema.kind === "Optional" ||
          (propSchema.options && "optional" in propSchema.options && propSchema.options.optional === true);
        
        const isRequired = 
          propSchema.options && "required" in propSchema.options && propSchema.options.required === true;
        
        if (isRequired || !isOptional) {
          required.push(key);
        }
      }
      
      return Type.Object(properties, {
        additionalProperties: schema.options?.additionalProperties,
      });
    }
    
    case "Ref": {
      // Ref is always a string (IRI)
      return Type.String({ format: "uri" });
    }
    
    case "Literal": {
      // Literal is a constant value
      return Type.Literal(schema.value);
    }
    
    case "Optional": {
      // Optional wraps another schema
      return Type.Optional(toTypeBox(schema.schema));
    }
    
    default: {
      // @ts-expect-error: exhaustive check
      throw new Error(`Unknown schema kind: ${schema.kind}`);
    }
  }
}

