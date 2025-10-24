// DAG: validate-shape
// Range constraint checking

import { isIRI } from "../../core/types/iri.ts";
import type { Range } from "../../core/types/range.ts";
import type { ShapeViolation } from "../report/types.ts";

/**
 * Check if a property value satisfies range constraints.
 *
 * This performs basic checks:
 * - For datatype range: check that value is a primitive (string, number, boolean)
 * - For shape range: check that value is a valid IRI string
 *
 * This does NOT:
 * - Validate literal values against XSD datatypes (e.g., xsd:integer format)
 * - Check if IRI references actually exist (that's external I/O)
 * - Validate referenced shape structure (that's recursive validation)
 *
 * @param propName - Property name
 * @param value - Property value
 * @param range - Range constraint
 * @returns Array of violations (empty if valid)
 */
export function checkRange(propName: string, value: unknown, range: Range): ShapeViolation[] {
  const violations: ShapeViolation[] = [];

  // Skip undefined/null (cardinality should catch this)
  if (value === undefined || value === null) {
    return violations;
  }

  // Handle array values
  const values = Array.isArray(value) ? value : [value];

  for (const val of values) {
    if (range.kind === "datatype") {
      // Datatype range: value should be a primitive
      if (typeof val === "object") {
        violations.push({
          path: propName,
          code: "DATATYPE_MISMATCH",
          message: `Property '${propName}' expects literal value (datatype: ${range.datatype}), got object`,
          expected: `datatype: ${range.datatype}`,
          actual: typeof val,
        });
      }
    } else if (range.kind === "shape") {
      // Shape range: value should be an IRI string
      if (typeof val !== "string") {
        violations.push({
          path: propName,
          code: "SHAPE_REFERENCE_INVALID",
          message: `Property '${propName}' expects IRI reference (shape: ${range.shapeId}), got ${typeof val}`,
          expected: `shape: ${range.shapeId}`,
          actual: typeof val,
        });
      } else if (!isIRI(val)) {
        violations.push({
          path: propName,
          code: "SHAPE_REFERENCE_INVALID",
          message: `Property '${propName}' expects valid IRI (shape: ${range.shapeId}), got '${val}'`,
          expected: `shape: ${range.shapeId}`,
          actual: val,
        });
      }
    }
  }

  return violations;
}
