// DAG: validate (main export)
// @gftdcojp/resourcebox-validate main entry point

// Report types
export type {
  ValidationResult,
  ValidationError,
  ShapeReport,
  ShapeViolation,
  ViolationCode,
} from "./report/index.js";

// Structure validation
export { validateStruct, validateStructBatch } from "./struct/index.js";

// Shape validation
export { validateShape, validateShapeBatch } from "./shape/index.js";

// Helper functions (for advanced usage)
export { checkCardinality, checkRange, checkType } from "./shape/index.js";
