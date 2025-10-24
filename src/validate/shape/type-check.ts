// DAG: validate-shape
// @type membership checking

import type { IRI } from "../../core/types/iri.ts";
import type { ShapeViolation } from "../report/types.ts";

/**
 * Check if a JSON-LD node's @type includes the expected class IRI.
 *
 * @param data - JSON-LD node data
 * @param expectedClassIri - Expected class IRI
 * @returns Array of violations (empty if valid)
 */
export function checkType(data: unknown, expectedClassIri: IRI<"Class">): ShapeViolation[] {
  const violations: ShapeViolation[] = [];

  // Ensure data is an object
  if (typeof data !== "object" || data === null) {
    violations.push({
      path: "@type",
      code: "TYPE_MISMATCH",
      message: "Data is not an object",
      expected: `@type includes ${expectedClassIri}`,
      actual: typeof data,
    });
    return violations;
  }

  const obj = data as Record<string, unknown>;

  // Get @type field
  const typeValue = obj["@type"];

  // @type can be string or array of strings
  let types: string[];
  if (typeof typeValue === "string") {
    types = [typeValue];
  } else if (Array.isArray(typeValue)) {
    types = typeValue.filter((t): t is string => typeof t === "string");
  } else {
    violations.push({
      path: "@type",
      code: "TYPE_MISMATCH",
      message: "@type field is missing or invalid",
      expected: `@type includes ${expectedClassIri}`,
      actual: typeValue,
    });
    return violations;
  }

  // Check if expected class IRI is in @type array
  if (!types.includes(expectedClassIri)) {
    violations.push({
      path: "@type",
      code: "TYPE_MISMATCH",
      message: `@type does not include expected class '${expectedClassIri}'`,
      expected: `@type includes ${expectedClassIri}`,
      actual: types,
    });
  }

  return violations;
}
