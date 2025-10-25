// DAG: validate-shape
// Shape validation (ShEx-like local node validation)

import type { Shape } from "../../core/types/shape.js";
import type { ShapeReport, ShapeViolation } from "../report/types.js";
import { checkCardinality } from "./cardinality-check.js";
import { checkRange } from "./range-check.js";
import { checkType } from "./type-check.js";

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

    // SHACL-lite: nodeKind
    const metaNodeKind = (propMeta as unknown as { nodeKind?: string }).nodeKind;
    if (propValue !== undefined && propValue !== null && metaNodeKind) {
      const nodeKind = metaNodeKind;
      const values = Array.isArray(propValue) ? propValue : [propValue];
      for (const v of values) {
        const isIri = typeof v === "string" && /^([a-zA-Z][a-zA-Z0-9+.-]*:)/.test(v);
        if (nodeKind === "IRI" && !isIri) {
          violations.push({
            path: propName,
            code: "NODE_KIND",
            message: `Property '${propName}' expects IRI`,
            expected: "IRI",
            actual: typeof v,
          });
        }
        if (nodeKind === "Literal" && (typeof v === "object" || isIri)) {
          violations.push({
            path: propName,
            code: "NODE_KIND",
            message: `Property '${propName}' expects literal`,
            expected: "Literal",
            actual: typeof v,
          });
        }
      }
    }

    // SHACL-lite: in
    const metaIn = (propMeta as unknown as { in?: ReadonlyArray<unknown> }).in;
    if (metaIn && propValue !== undefined) {
      const allowed = new Set(metaIn);
      const values = Array.isArray(propValue) ? propValue : [propValue];
      for (const v of values) {
        if (!allowed.has(v)) {
          violations.push({
            path: propName,
            code: "IN",
            message: `Property '${propName}' value not in allowed set`,
            expected: Array.from(allowed).join(","),
            actual: v,
          });
        }
      }
    }

    // SHACL-lite: hasValue
    const metaHasValue = (propMeta as unknown as { hasValue?: unknown }).hasValue;
    if (metaHasValue !== undefined) {
      const expectedVal = metaHasValue;
      const values = Array.isArray(propValue) ? propValue : [propValue];
      const ok = values.some((v) => v === expectedVal);
      if (!ok) {
        violations.push({
          path: propName,
          code: "HAS_VALUE",
          message: `Property '${propName}' must have value ${String(expectedVal)}`,
          expected: expectedVal,
          actual: propValue,
        });
      }
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
export function validateShapeBatch(shape: Shape, dataArray: readonly unknown[]): ShapeReport[] {
  return dataArray.map((data) => validateShape(shape, data));
}
