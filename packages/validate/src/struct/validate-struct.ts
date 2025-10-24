// DAG: validate-struct
// Structure validation using Ajv

import type { Shape } from "@gftdcojp/shapebox-core";
import type { ValidationError, ValidationResult } from "../report/types.ts";
import { getAjvInstance } from "./ajv-setup.ts";

/**
 * Validate the structure of a JSON-LD node against a Shape's schema.
 *
 * This performs Ajv-based validation of:
 * - Property types (string, number, boolean, array, object)
 * - Format constraints (email, uri, date-time, etc.)
 * - Required vs optional properties
 * - Array constraints (minItems, maxItems, etc.)
 *
 * This does NOT validate:
 * - Cardinality constraints (use validateShape for that)
 * - Range constraints (datatype vs shape)
 * - @type membership
 *
 * @param shape - Shape definition with TypeBox schema
 * @param data - JSON-LD node data to validate
 * @returns ValidationResult with ok flag and errors
 *
 * @example
 * ```ts
 * const result = validateStruct(PersonShape, {
 *   "@id": "ex:john",
 *   "@type": ["ex:Person"],
 *   email: "john@example.com",
 * });
 *
 * if (!result.ok) {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
export function validateStruct(shape: Shape, data: unknown): ValidationResult {
  const ajv = getAjvInstance();

  // Compile schema (Ajv caches compiled schemas internally)
  const validate = ajv.compile(shape.schema);

  // Run validation
  const valid = validate(data);

  if (valid) {
    return { ok: true, errors: [] };
  }

  // Convert Ajv errors to our format
  const errors: ValidationError[] = (validate.errors ?? []).map((err) => ({
    path: err.instancePath || "/",
    message: err.message ?? "Validation error",
    keyword: err.keyword,
    schemaPath: err.schemaPath,
    params: err.params,
  }));

  return { ok: false, errors };
}

/**
 * Validate multiple nodes against the same shape.
 * More efficient than calling validateStruct repeatedly,
 * as the schema is compiled once.
 *
 * @param shape - Shape definition
 * @param dataArray - Array of JSON-LD nodes to validate
 * @returns Array of ValidationResults
 */
export function validateStructBatch(
  shape: Shape,
  dataArray: readonly unknown[]
): ValidationResult[] {
  const ajv = getAjvInstance();
  const validate = ajv.compile(shape.schema);

  return dataArray.map((data) => {
    const valid = validate(data);

    if (valid) {
      return { ok: true, errors: [] };
    }

    const errors: ValidationError[] = (validate.errors ?? []).map((err) => ({
      path: err.instancePath || "/",
      message: err.message ?? "Validation error",
      keyword: err.keyword,
      schemaPath: err.schemaPath,
      params: err.params,
    }));

    return { ok: false, errors };
  });
}
