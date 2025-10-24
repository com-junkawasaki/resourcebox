// DAG: core-typecheck
// Compile-time check: range.datatype and range.shape are mutually exclusive

import type { Range } from "../types/range.ts";

/**
 * Range exclusivity is already enforced by the discriminated union type.
 * 
 * Range = 
 *   | { kind: "datatype"; datatype: IRI }
 *   | { kind: "shape"; shapeId: string }
 * 
 * TypeScript's type system prevents creating a Range with both fields,
 * so no additional type-level check is needed here.
 * 
 * This module exists for documentation completeness and potential future extensions.
 */

/**
 * Validate that a Range is well-formed (has exactly one kind).
 * This is a no-op at type level since discriminated unions already enforce it.
 * 
 * @template TRange - Range type
 * @returns void (always valid due to discriminated union)
 */
export type ValidateRangeExclusivity<TRange extends Range> = void;

/**
 * Runtime check for range exclusivity (defensive programming).
 * This should never fail if TypeScript types are respected.
 * 
 * @param range - Range to validate
 * @returns Error message if invalid (should never happen), undefined if valid
 */
export function validateRangeExclusivityRuntime(range: Range): string | undefined {
  if (range.kind === "datatype") {
    if ("shapeId" in range) {
      return "Range has kind='datatype' but also has shapeId field";
    }
    if (!("datatype" in range)) {
      return "Range has kind='datatype' but missing datatype field";
    }
  } else if (range.kind === "shape") {
    if ("datatype" in range) {
      return "Range has kind='shape' but also has datatype field";
    }
    if (!("shapeId" in range)) {
      return "Range has kind='shape' but missing shapeId field";
    }
  } else {
    return `Range has invalid kind: ${(range as { kind: string }).kind}`;
  }
  
  return undefined;
}

