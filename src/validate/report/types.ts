// DAG: validate-shape (report types)
// Validation report types

/**
 * Validation result for structure validation (Ajv).
 */
export interface ValidationResult {
  /**
   * Whether validation passed.
   */
  readonly ok: boolean;

  /**
   * Validation errors (if any).
   * These are Ajv-style errors.
   */
  readonly errors: readonly ValidationError[];
}

/**
 * Validation error from Ajv.
 */
export interface ValidationError {
  /**
   * JSON pointer to the invalid data location.
   * E.g., "/email", "/@type/0"
   */
  readonly path: string;

  /**
   * Error message.
   */
  readonly message: string;

  /**
   * Error keyword (e.g., "type", "format", "required").
   */
  readonly keyword?: string;

  /**
   * Schema path that failed.
   */
  readonly schemaPath?: string;

  /**
   * Additional error params.
   */
  readonly params?: Record<string, unknown>;
}

/**
 * Validation report for shape validation (ShEx-like).
 */
export interface ShapeReport {
  /**
   * Whether shape validation passed.
   */
  readonly ok: boolean;

  /**
   * Shape violations (if any).
   */
  readonly violations: readonly ShapeViolation[];
}

/**
 * Shape violation details.
 */
export interface ShapeViolation {
  /**
   * Property path that violated the constraint.
   */
  readonly path: string;

  /**
   * Violation code.
   */
  readonly code: ViolationCode;

  /**
   * Human-readable message.
   */
  readonly message: string;

  /**
   * Expected value or constraint.
   */
  readonly expected?: unknown;

  /**
   * Actual value (if relevant).
   */
  readonly actual?: unknown;
}

/**
 * Violation codes for shape validation.
 */
export type ViolationCode =
  | "CARDINALITY_MIN" // min count not satisfied
  | "CARDINALITY_MAX" // max count exceeded
  | "CARDINALITY_REQUIRED" // required property missing
  | "RANGE_MISMATCH" // value doesn't match expected range
  | "TYPE_MISMATCH" // @type doesn't include expected class IRI
  | "DATATYPE_MISMATCH" // literal value doesn't match expected datatype
  | "SHAPE_REFERENCE_INVALID" // IRI reference is not a valid IRI
  | "NODE_KIND"
  | "IN"
  | "HAS_VALUE"
  | "OR"
  | "XONE"
  | "UNKNOWN"; // other violations
