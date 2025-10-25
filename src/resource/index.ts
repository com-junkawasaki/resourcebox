// Resource - Resource layer (data structure definition) API

import { ResourceArray } from "./array.js";
import type { ArrayOptions } from "./array.js";
import { context, extractNamespaces } from "./context.js";
import type { ContextMap, ContextOptions, ContextValue, JsonLdContext } from "./context.js";
import { Literal } from "./literal.js";
import type { ObjectOptions } from "./object.js";
import { Object as ObjectSchemaBuilder, isObject } from "./object.js";
import { Optional, isOptional, isRequired } from "./optional.js";
import { ResourceBoolean, ResourceNumber, ResourceString } from "./primitives.js";
import type { BooleanOptions, NumberOptions, StringOptions } from "./primitives.js";
import { Ref } from "./ref.js";
import type { RefOptions } from "./ref.js";
import { Shaped } from "./shaped.js";
import type { ShapedOptions, ShapedResource } from "./shaped.js";
import type { Static } from "./static.js";
import { toTypeBox } from "./to-typebox.js";
import { extractMetadata } from "./types.js";
import type {
  AnyResourceSchema,
  ArraySchema,
  BooleanSchema,
  LiteralSchema,
  NumberSchema,
  ObjectSchema,
  OptionalSchema,
  RefSchema,
  ResourceBaseOptions,
  ResourceKind,
  ResourceMetadata,
  ResourceSchema,
  StringSchema,
} from "./types.js";
import { check, parse, validate } from "./validate.js";
import type { ValidationError, ValidationResult } from "./validate.js";

export {
  ResourceString as String,
  ResourceNumber as Number,
  ResourceBoolean as Boolean,
  ResourceArray as Array,
  ObjectSchemaBuilder as Object,
  Ref,
  Literal,
  Optional,
  validate,
  check,
  parse,
  context,
  extractNamespaces,
  Shaped,
  extractMetadata,
  isOptional,
  isRequired,
  isObject,
  toTypeBox,
};

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
  StringOptions,
  NumberOptions,
  BooleanOptions,
  ArrayOptions,
  ObjectOptions,
  RefOptions,
  ValidationResult,
  ValidationError,
  ContextValue,
  ContextMap,
  JsonLdContext,
  ContextOptions,
  ShapedOptions,
  ShapedResource,
  Static,
};

export const Resource = {
  String: ResourceString,
  Number: ResourceNumber,
  Boolean: ResourceBoolean,
  Array: ResourceArray,
  Object: ObjectSchemaBuilder,
  Ref,
  Literal,
  Optional,
  validate,
  check,
  parse,
  context,
  extractNamespaces,
  Shaped,
  extractMetadata,
  isOptional,
  isRequired,
  isObject,
  toTypeBox,
};
