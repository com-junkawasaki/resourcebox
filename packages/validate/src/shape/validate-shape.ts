// DAG: validate-shape
// Shape validation (ShEx-like local node validation)

import type { Shape } from "@gftdcojp/shapebox-core";
import type { ShapeReport, ShapeViolation } from "../report/types.ts";
import { checkCardinality } from "./cardinality-check.ts";
import { checkRange } from "./range-check.ts";
import { checkType } from "./type-check.ts";

/**
 * Validate a JSON-LD node against a Shape definition.
 * 
 * This performs ShEx-like local node validation:
 * - @type membership check (node must have the shape's class IRI in @type)
 * - Cardinality constraints (min/max/required)
 * - Range constraints (datatype vs shape reference)
 * 
 * This does NOT:
 * - Validate structure/formats (use validateStruct for that)
 * - Check if referenced IRIs exist (no external I/O)
 * - Recursively validate referenced shapes
 * - Perform inference or reasoning
 * 
 * @param shape - Shape definition
 * @param data - JSON-LD node data to validate
 * @returns ShapeReport with ok flag and violations
 * 
 * @example
 * ```ts
 * const report = validateShape(PersonShape, {
 *   "@id": "ex:john",
 *   "@type": ["ex:Person"],
 *   email: "john@example.com",
 *   manager: "ex:jane",
 * });
 * 
 * if (!report.ok) {
 *   console.error("Shape violations:", report.violations);
 * }
 * ```
 */
export function validateShape(shape: Shape, data: unknown): ShapeReport {
  const violations: ShapeViolation[] = [];
  
  // Ensure data is an object
  if (typeof data !== "object" || data === null) {
    violations.push({
      path: "/",
      code: "UNKNOWN",
      message: "Data must be an object",
      expected: "object",
      actual: typeof data,
    });
    return { ok: false, violations };
  }
  
  const obj = data as Record<string, unknown>;
  
  // 1. Check @type membership
  violations.push(...checkType(obj, shape.classIri));
  
  // 2. Check each property's cardinality and range
  for (const [propName, propMeta] of Object.entries(shape.props)) {
    // Skip JSON-LD special keys
    if (propName === "@id" || propName === "@type" || propName === "@context") {
      continue;
    }
    
    if (!propMeta) {
      continue;
    }
    
    const propValue = obj[propName];
    
    // Check cardinality
    violations.push(...checkCardinality(propName, propValue, propMeta.cardinality));
    
    // Check range (only if value exists)
    if (propValue !== undefined && propValue !== null) {
      violations.push(...checkRange(propName, propValue, propMeta.range));
    }
  }
  
  return {
    ok: violations.length === 0,
    violations,
  };
}

/**
 * Validate multiple nodes against the same shape.
 * 
 * @param shape - Shape definition
 * @param dataArray - Array of JSON-LD nodes to validate
 * @returns Array of ShapeReports
 */
export function validateShapeBatch(
  shape: Shape,
  dataArray: readonly unknown[]
): ShapeReport[] {
  return dataArray.map((data) => validateShape(shape, data));
}

