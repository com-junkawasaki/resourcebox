// DAG: core-types
// Cardinality constraints for SHACL-lite shape validation

/**
 * Cardinality constraint definition.
 * 
 * Represents min/max occurrence constraints similar to SHACL sh:minCount and sh:maxCount.
 * This is used for both compile-time type checking and runtime shape validation.
 * 
 * @property min - Minimum number of occurrences (default: 0)
 * @property max - Maximum number of occurrences (undefined = unbounded)
 * @property required - Whether the property must be present (affects type-level Optional checking)
 * 
 * @example
 * ```ts
 * // Exactly one (required)
 * const exactlyOne: Cardinality = { min: 1, max: 1, required: true };
 * 
 * // Zero or one (optional)
 * const optional: Cardinality = { min: 0, max: 1, required: false };
 * 
 * // One or more (required)
 * const oneOrMore: Cardinality = { min: 1, max: undefined, required: true };
 * 
 * // Zero or more (optional)
 * const zeroOrMore: Cardinality = { min: 0, max: undefined, required: false };
 * ```
 */
export interface Cardinality {
  /**
   * Minimum number of occurrences (SHACL sh:minCount).
   * Must be >= 0.
   */
  readonly min: number;
  
  /**
   * Maximum number of occurrences (SHACL sh:maxCount).
   * undefined means unbounded.
   */
  readonly max: number | undefined;
  
  /**
   * Whether this property is required.
   * This affects compile-time type checking:
   * - required=true + schema Optional → compile error
   * - required=false + schema non-Optional → allowed (more permissive schema)
   */
  readonly required: boolean;
}

/**
 * Validate cardinality constraint structure.
 * 
 * @param card - Cardinality to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateCardinalityStructure(card: Cardinality): string | undefined {
  if (card.min < 0) {
    return "Cardinality min must be >= 0";
  }
  
  if (card.max !== undefined) {
    if (card.max < 0) {
      return "Cardinality max must be >= 0 or undefined";
    }
    if (card.max < card.min) {
      return `Cardinality max (${card.max}) must be >= min (${card.min})`;
    }
  }
  
  // Semantic check: required=true implies min >= 1
  if (card.required && card.min === 0) {
    return "Cardinality with required=true should have min >= 1";
  }
  
  return undefined;
}

/**
 * Check if a cardinality allows a specific count.
 * 
 * @param card - Cardinality constraint
 * @param count - Number of occurrences to check
 * @returns True if count satisfies the cardinality constraint
 */
export function satisfiesCardinality(card: Cardinality, count: number): boolean {
  if (count < card.min) return false;
  if (card.max !== undefined && count > card.max) return false;
  return true;
}

/**
 * Common cardinality patterns as constants.
 */
export const CARDINALITY_PATTERNS = {
  /** Exactly one (1..1, required) */
  EXACTLY_ONE: { min: 1, max: 1, required: true } as const satisfies Cardinality,
  
  /** Zero or one (0..1, optional) */
  OPTIONAL: { min: 0, max: 1, required: false } as const satisfies Cardinality,
  
  /** One or more (1..*, required) */
  ONE_OR_MORE: { min: 1, max: undefined, required: true } as const satisfies Cardinality,
  
  /** Zero or more (0..*, optional) */
  ZERO_OR_MORE: { min: 0, max: undefined, required: false } as const satisfies Cardinality,
} as const;

