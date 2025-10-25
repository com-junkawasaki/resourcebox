// Resource - Resource layer (data structure definition) API

// Types
export type {
  ResourceBaseOptions,
  ResourceKind,
  ResourceSchema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  ArraySchema,
  ObjectSchema,
  RefSchema,
  LiteralSchema,
  OptionalSchema,
  AnyResourceSchema,
  ResourceMetadata,
} from "./types.js";

export { extractMetadata } from "./types.js";

// Primitives
export { ResourceString as String, ResourceNumber as Number, ResourceBoolean as Boolean } from "./primitives.js";
export type { StringOptions, NumberOptions, BooleanOptions } from "./primitives.js";

// Complex types
export { ResourceArray as Array } from "./array.js";
export type { ArrayOptions } from "./array.js";

export { Object, isObject } from "./object.js";
export type { ObjectOptions } from "./object.js";

export { Ref } from "./ref.js";
export type { RefOptions } from "./ref.js";

export { Literal } from "./literal.js";

export { Optional, isOptional, isRequired } from "./optional.js";

// Type inference
export type { Static } from "./static.js";

// Validation
export { validate, check, parse } from "./validate.js";
export type { ValidationResult, ValidationError } from "./validate.js";

// JSON-LD context
export { context, extractNamespaces } from "./context.js";
export type { ContextValue, ContextMap, JsonLdContext, ContextOptions } from "./context.js";

// Shaped (integrated API)
export { Shaped } from "./shaped.js";
export type { ShapedOptions, ShapedResource, ShapedPropertyDef } from "./shaped.js";

// Internal helpers
export { toTypeBox } from "./to-typebox.js";
