// Resource.validate - Validate data against resource schema

import type { AnyResourceSchema } from "./types.js";
import { toTypeBox } from "./to-typebox.js";
import { getAjvInstance } from "../validate/struct/ajv-setup.js";

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  readonly ok: boolean;
  readonly data?: T;
  readonly errors?: ReadonlyArray<ValidationError>;
}

/**
 * Validation error
 */
export interface ValidationError {
  readonly path: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Validate data against resource schema
 * Returns validation result with typed data
 * 
 * @example
 * ```ts
 * const Person = Resource.Object({
 *   name: Resource.String({ minLength: 1 }),
 *   age: Resource.Number({ minimum: 0 })
 * })
 * 
 * const result = Resource.validate(Person, data)
 * if (result.ok) {
 *   console.log(result.data)  // Typed data
 * } else {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validate<S extends AnyResourceSchema>(
  schema: S,
  data: unknown
): ValidationResult {
  try {
    // Convert to TypeBox schema
    const typeboxSchema = toTypeBox(schema);
    
    // Get Ajv instance with format support
    const ajv = getAjvInstance();
    
    // Compile and validate
    const validate = ajv.compile(typeboxSchema);
    const isValid = validate(data);
    
    if (isValid) {
      return {
        ok: true,
        data: data as unknown,
      };
    }
    
    // Collect errors
    const errors: ValidationError[] = [];
    if (validate.errors) {
      for (const error of validate.errors) {
        errors.push({
          path: error.instancePath || "/",
          message: error.message || "Validation error",
          value: data,
        });
      }
    }
    
    return {
      ok: false,
      errors,
    };
  } catch (error) {
    return {
      ok: false,
      errors: [
        {
          path: "/",
          message: error instanceof Error ? error.message : "Validation error",
        },
      ],
    };
  }
}

/**
 * Check if data matches schema (boolean result)
 * 
 * @example
 * ```ts
 * if (Resource.check(Person, data)) {
 *   // data is valid
 * }
 * ```
 */
export function check<S extends AnyResourceSchema>(
  schema: S,
  data: unknown
): boolean {
  const result = validate(schema, data);
  return result.ok;
}

/**
 * Parse data and throw if invalid
 * 
 * @example
 * ```ts
 * const person = Resource.parse(Person, data)  // Throws if invalid
 * ```
 */
export function parse<S extends AnyResourceSchema>(
  schema: S,
  data: unknown
): unknown {
  const result = validate(schema, data);
  
  if (!result.ok) {
    const errorMessages = result.errors?.map(e => `${e.path}: ${e.message}`).join("\n");
    throw new Error(`Validation failed:\n${errorMessages}`);
  }
  
  return result.data;
}

