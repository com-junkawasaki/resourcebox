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
      const typeOpts: Record<string, unknown> = {};
      if (opts.minLength !== undefined) typeOpts.minLength = opts.minLength;
      if (opts.maxLength !== undefined) typeOpts.maxLength = opts.maxLength;
      if (opts.pattern !== undefined) typeOpts.pattern = opts.pattern;
      if (opts.format !== undefined) typeOpts.format = opts.format;
      return Type.String(typeOpts);
    }

    case "Number": {
      const opts = schema.options || {};
      const typeOpts: Record<string, unknown> = {};
      if (opts.minimum !== undefined) typeOpts.minimum = opts.minimum;
      if (opts.maximum !== undefined) typeOpts.maximum = opts.maximum;
      if (opts.exclusiveMinimum !== undefined) typeOpts.exclusiveMinimum = opts.exclusiveMinimum;
      if (opts.exclusiveMaximum !== undefined) typeOpts.exclusiveMaximum = opts.exclusiveMaximum;
      if (opts.multipleOf !== undefined) typeOpts.multipleOf = opts.multipleOf;
      return Type.Number(typeOpts);
    }

    case "Boolean": {
      return Type.Boolean();
    }

    case "Array": {
      const opts = schema.options || {};
      const typeOpts: Record<string, unknown> = {};
      if (opts.minItems !== undefined) typeOpts.minItems = opts.minItems;
      if (opts.maxItems !== undefined) typeOpts.maxItems = opts.maxItems;
      if (opts.uniqueItems !== undefined) typeOpts.uniqueItems = opts.uniqueItems;
      return Type.Array(toTypeBox(schema.items), typeOpts);
    }

    case "Object": {
      const properties: Record<string, TSchema> = {};
      const required: string[] = [];

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        properties[key] = toTypeBox(propSchema as AnyResourceSchema);

        // Check if property is required
        const isOptional =
          propSchema.kind === "Optional" ||
          (propSchema.options &&
            "optional" in propSchema.options &&
            propSchema.options.optional === true);

        const isRequired =
          propSchema.options &&
          "required" in propSchema.options &&
          propSchema.options.required === true;

        if (isRequired || !isOptional) {
          required.push(key);
        }
      }

      const typeOpts: Record<string, unknown> = {};
      if (schema.options?.additionalProperties !== undefined) {
        typeOpts.additionalProperties = schema.options.additionalProperties;
      }
      return Type.Object(properties, typeOpts);
    }

    case "Ref": {
      // Ref is always a string (IRI)
      return Type.String({ format: "uri" });
    }

    case "Literal": {
      // Literal is a constant value
      // Use Type.Const for arrays/objects, Type.Literal for primitives
      if (
        Array.isArray(schema.value) ||
        (typeof schema.value === "object" && schema.value !== null)
      ) {
        return Type.Unsafe({ const: schema.value });
      }
      return Type.Literal(schema.value as string | number | boolean);
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
