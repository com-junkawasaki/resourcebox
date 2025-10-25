// Shape - SHACL shape layer API

// Types
export type {
  ShapePropertyDef,
  ShapeNodeDef,
  ShapeValidationResult,
  ShapeViolation,
} from "./types.js";

// Define
export { Define } from "./define.js";
export type { DefineOptions } from "./define.js";

// Property
export { Property } from "./property.js";
export type { PropertyOptions } from "./property.js";

// From Resource
export { fromResource } from "./from-resource.js";
export type { FromResourceOptions } from "./from-resource.js";

// Validate
export { validate, check } from "./validate.js";
