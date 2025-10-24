// DAG: validate-shape
// Cardinality constraint checking

import type { Cardinality } from "../../core/types/cardinality.ts";
import type { ShapeViolation } from "../report/types.ts";

/**
 * Check if a property value satisfies cardinality constraints.
 *
 * @param propName - Property name
 * @param value - Property value (can be undefined, single value, or array)
 * @param cardinality - Cardinality constraint
 * @returns Array of violations (empty if valid)
 */
export function checkCardinality(
  propName: string,
  value: unknown,
  cardinality: Cardinality
): ShapeViolation[] {
  const violations: ShapeViolation[] = [];

  // Count occurrences
  let count = 0;
  if (value === undefined || value === null) {
    count = 0;
  } else if (Array.isArray(value)) {
    count = value.length;
  } else {
    count = 1;
  }

  // Check required
  if (cardinality.required && count === 0) {
    violations.push({
      path: propName,
      code: "CARDINALITY_REQUIRED",
      message: `Property '${propName}' is required but missing`,
      expected: `min: ${cardinality.min}`,
      actual: 0,
    });
    return violations; // Don't check min/max if required fails
  }

  // Check min
  if (count < cardinality.min) {
    violations.push({
      path: propName,
      code: "CARDINALITY_MIN",
      message: `Property '${propName}' has ${count} occurrence(s), expected at least ${cardinality.min}`,
      expected: `min: ${cardinality.min}`,
      actual: count,
    });
  }

  // Check max
  if (cardinality.max !== undefined && count > cardinality.max) {
    violations.push({
      path: propName,
      code: "CARDINALITY_MAX",
      message: `Property '${propName}' has ${count} occurrence(s), expected at most ${cardinality.max}`,
      expected: `max: ${cardinality.max}`,
      actual: count,
    });
  }

  return violations;
}
