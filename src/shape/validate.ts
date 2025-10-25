// Shape.validate - Validate data against SHACL shape

import { getClassIRI, isClass } from "../onto/class.js";
import type {
  ShapeNodeDef,
  ShapePropertyDef,
  ShapeValidationResult,
  ShapeViolation,
} from "./types.js";

/**
 * Validate data against SHACL shape
 * Checks semantic constraints (SHACL)
 *
 * @example
 * ```ts
 * const result = Shape.validate(PersonShape, data)
 * if (!result.ok) {
 *   console.error(result.violations)
 * }
 * ```
 */
export function validate(shape: ShapeNodeDef, data: unknown): ShapeValidationResult {
  const violations: ShapeViolation[] = [];

  // Data must be an object
  if (typeof data !== "object" || data === null) {
    return {
      ok: false,
      violations: [
        {
          path: "/",
          message: "Data must be an object",
          value: data,
          constraint: "type",
        },
      ],
    };
  }

  const dataObj = data as Record<string, unknown>;

  // Check target class (if @type exists)
  if ("@type" in dataObj) {
    const targetClassIRI = isClass(shape.targetClass)
      ? getClassIRI(shape.targetClass)
      : shape.targetClass;

    const types = Array.isArray(dataObj["@type"]) ? dataObj["@type"] : [dataObj["@type"]];
    if (!types.includes(targetClassIRI)) {
      violations.push({
        path: "/@type",
        message: `Expected @type to include ${targetClassIRI}`,
        value: dataObj["@type"],
        constraint: "targetClass",
      });
    }
  }

  // Validate each property
  for (const [propKey, propShape] of Object.entries(shape.property)) {
    const value = dataObj[propKey];

    // Check minCount
    if (propShape.minCount !== undefined) {
      const count = value === undefined ? 0 : Array.isArray(value) ? value.length : 1;
      if (count < propShape.minCount) {
        violations.push({
          path: `/${propKey}`,
          message: `Expected at least ${propShape.minCount} value(s), got ${count}`,
          value,
          constraint: "minCount",
        });
      }
    }

    // Check maxCount
    if (propShape.maxCount !== undefined && value !== undefined) {
      const count = Array.isArray(value) ? value.length : 1;
      if (count > propShape.maxCount) {
        violations.push({
          path: `/${propKey}`,
          message: `Expected at most ${propShape.maxCount} value(s), got ${count}`,
          value,
          constraint: "maxCount",
        });
      }
    }

    // Skip further checks if value is undefined
    if (value === undefined) {
      continue;
    }

    // Check string constraints
    if (typeof value === "string") {
      if (propShape.minLength !== undefined && value.length < propShape.minLength) {
        violations.push({
          path: `/${propKey}`,
          message: `String length must be at least ${propShape.minLength}, got ${value.length}`,
          value,
          constraint: "minLength",
        });
      }

      if (propShape.maxLength !== undefined && value.length > propShape.maxLength) {
        violations.push({
          path: `/${propKey}`,
          message: `String length must be at most ${propShape.maxLength}, got ${value.length}`,
          value,
          constraint: "maxLength",
        });
      }

      if (propShape.pattern !== undefined) {
        const regex = new RegExp(propShape.pattern);
        if (!regex.test(value)) {
          violations.push({
            path: `/${propKey}`,
            message: `String must match pattern ${propShape.pattern}`,
            value,
            constraint: "pattern",
          });
        }
      }
    }

    // Check number constraints
    if (typeof value === "number") {
      if (propShape.minInclusive !== undefined && value < propShape.minInclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be >= ${propShape.minInclusive}, got ${value}`,
          value,
          constraint: "minInclusive",
        });
      }

      if (propShape.maxInclusive !== undefined && value > propShape.maxInclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be <= ${propShape.maxInclusive}, got ${value}`,
          value,
          constraint: "maxInclusive",
        });
      }

      if (propShape.minExclusive !== undefined && value <= propShape.minExclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be > ${propShape.minExclusive}, got ${value}`,
          value,
          constraint: "minExclusive",
        });
      }

      if (propShape.maxExclusive !== undefined && value >= propShape.maxExclusive) {
        violations.push({
          path: `/${propKey}`,
          message: `Number must be < ${propShape.maxExclusive}, got ${value}`,
          value,
          constraint: "maxExclusive",
        });
      }
    }

    // SHACL-lite: nodeKind
    if (propShape.nodeKind) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        const isIri = typeof v === "string" && /^([a-zA-Z][a-zA-Z0-9+.-]*:)/.test(v);
        if (propShape.nodeKind === "IRI" && !isIri) {
          violations.push({
            path: `/${propKey}`,
            message: "Expected IRI nodeKind",
            value: v,
            constraint: "nodeKind",
          });
        }
        if (propShape.nodeKind === "Literal" && (typeof v === "object" || isIri)) {
          violations.push({
            path: `/${propKey}`,
            message: "Expected Literal nodeKind",
            value: v,
            constraint: "nodeKind",
          });
        }
      }
    }

    // SHACL-lite: in
    if (propShape.in) {
      const allowed = new Set(propShape.in as ReadonlyArray<unknown>);
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (!allowed.has(v)) {
          violations.push({
            path: `/${propKey}`,
            message: "Value not in allowed set",
            value: v,
            constraint: "in",
          });
        }
      }
    }

    // SHACL-lite: hasValue
    if (propShape.hasValue !== undefined) {
      const expectedVal = propShape.hasValue as unknown;
      const values = Array.isArray(value) ? value : [value];
      const ok = values.some((v) => v === expectedVal);
      if (!ok) {
        violations.push({
          path: `/${propKey}`,
          message: `Expected hasValue = ${String(expectedVal)}`,
          value,
          constraint: "hasValue",
        });
      }
    }

    // SHACL: or / xone (evaluate against sub-defs on the same value)
    if (propShape.or && propShape.or.length > 0) {
      const satisfied = propShape.or.some((alt) => satisfiesValueConstraints(value, alt));
      if (!satisfied) {
        violations.push({
          path: `/${propKey}`,
          message: "No alternative in sh:or satisfied",
          value,
          constraint: "or",
        });
      }
    }

    if (propShape.xone && propShape.xone.length > 0) {
      const count = propShape.xone.reduce(
        (acc, alt) => acc + (satisfiesValueConstraints(value, alt) ? 1 : 0),
        0
      );
      if (count !== 1) {
        violations.push({
          path: `/${propKey}`,
          message: `Exactly one alternative in sh:xone must be satisfied (got ${count})`,
          value,
          constraint: "xone",
        });
      }
    }
  }

  return {
    ok: violations.length === 0,
    ...(violations.length > 0 && { violations }),
  };
}

// Check only value-level constraints (no cardinality) for or/xone branches
function satisfiesValueConstraints(value: unknown, def: Partial<ShapePropertyDef>): boolean {
  // nodeKind
  if (def.nodeKind) {
    const isIri = typeof value === "string" && /^([a-zA-Z][a-zA-Z0-9+.-]*:)/.test(value);
    if (def.nodeKind === "IRI" && !isIri) return false;
    if (def.nodeKind === "Literal" && (typeof value === "object" || isIri)) return false;
  }
  // in
  if (def.in) {
    const allowed = new Set(def.in as ReadonlyArray<unknown>);
    const values = Array.isArray(value) ? value : [value];
    if (!values.every((v) => allowed.has(v))) return false;
  }
  // hasValue
  if (def.hasValue !== undefined) {
    const values = Array.isArray(value) ? value : [value];
    if (!values.some((v) => v === def.hasValue)) return false;
  }
  // strings
  if (typeof value === "string") {
    if (def.minLength !== undefined && value.length < def.minLength) return false;
    if (def.maxLength !== undefined && value.length > def.maxLength) return false;
    if (def.pattern !== undefined && !new RegExp(def.pattern).test(value)) return false;
  }
  // numbers
  if (typeof value === "number") {
    if (def.minInclusive !== undefined && value < def.minInclusive) return false;
    if (def.maxInclusive !== undefined && value > def.maxInclusive) return false;
    if (def.minExclusive !== undefined && value <= def.minExclusive) return false;
    if (def.maxExclusive !== undefined && value >= def.maxExclusive) return false;
  }
  return true;
}

/**
 * Check if data matches shape (boolean result)
 */
export function check(shape: ShapeNodeDef, data: unknown): boolean {
  const result = validate(shape, data);
  return result.ok;
}
