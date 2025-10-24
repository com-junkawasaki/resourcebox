// DAG: core-api
// Cardinality helper functions for creating cardinality constraints

import type { Cardinality } from "../types/cardinality.js";
import { CARDINALITY_PATTERNS, validateCardinalityStructure } from "../types/cardinality.js";

/**
 * Create a cardinality constraint.
 *
 * @param opts - Cardinality options
 * @param opts.min - Minimum occurrences (default: 0)
 * @param opts.max - Maximum occurrences (undefined = unbounded, default: undefined)
 * @param opts.required - Whether property is required (default: min >= 1)
 * @returns Cardinality constraint
 * @throws Error if cardinality structure is invalid
 *
 * @example
 * ```ts
 * // Exactly one (1..1, required)
 * cardinality({ min: 1, max: 1, required: true });
 *
 * // Zero or one (0..1, optional)
 * cardinality({ min: 0, max: 1, required: false });
 *
 * // One or more (1..*, required)
 * cardinality({ min: 1, required: true });
 *
 * // Zero or more (0..*, optional)
 * cardinality({ min: 0 });
 * ```
 */
export function cardinality(opts: {
  min?: number;
  max?: number | undefined;
  required?: boolean;
}): Cardinality {
  const min = opts.min ?? 0;
  const max = opts.max;
  const required = opts.required ?? min >= 1;

  const card: Cardinality = { min, max, required };

  const error = validateCardinalityStructure(card);
  if (error) {
    throw new Error(`Invalid cardinality: ${error}`);
  }

  return card;
}

/**
 * Exactly one (1..1, required).
 * Shorthand for cardinality({ min: 1, max: 1, required: true }).
 */
export function exactlyOne(): Cardinality {
  return CARDINALITY_PATTERNS.EXACTLY_ONE;
}

/**
 * Zero or one (0..1, optional).
 * Shorthand for cardinality({ min: 0, max: 1, required: false }).
 */
export function optional(): Cardinality {
  return CARDINALITY_PATTERNS.OPTIONAL;
}

/**
 * One or more (1..*, required).
 * Shorthand for cardinality({ min: 1, required: true }).
 */
export function oneOrMore(): Cardinality {
  return CARDINALITY_PATTERNS.ONE_OR_MORE;
}

/**
 * Zero or more (0..*, optional).
 * Shorthand for cardinality({ min: 0, required: false }).
 */
export function zeroOrMore(): Cardinality {
  return CARDINALITY_PATTERNS.ZERO_OR_MORE;
}
