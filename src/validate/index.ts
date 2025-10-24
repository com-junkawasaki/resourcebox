// DAG: validate (main export)
// @gftdcojp/shapebox-validate main entry point

// Report types
export type {
  ValidationResult,
  ValidationError,
  ShapeReport,
  ShapeViolation,
  ViolationCode,
} from "./report/index.ts";

// Structure validation
export { validateStruct, validateStructBatch } from "./struct/index.ts";

// Shape validation
export { validateShape, validateShapeBatch } from "./shape/index.ts";

// Helper functions (for advanced usage)
export { checkCardinality, checkRange, checkType } from "./shape/index.ts";
