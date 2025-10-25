// Resource.Static - Type inference from resource schemas

import type {
  AnyResourceSchema,
  ArraySchema,
  BooleanSchema,
  LiteralSchema,
  NumberSchema,
  ObjectSchema,
  OptionalSchema,
  RefSchema,
  StringSchema,
} from "./types.js";

/**
 * Infer TypeScript type from StringSchema
 */
type InferString = string;

/**
 * Infer TypeScript type from NumberSchema
 */
type InferNumber = number;

/**
 * Infer TypeScript type from BooleanSchema
 */
type InferBoolean = boolean;

/**
 * Infer TypeScript type from ArraySchema
 */
type InferArray<S extends ArraySchema> = Array<Static<S["items"]>>;

/**
 * Infer TypeScript type from ObjectSchema
 */
type InferObject<S extends ObjectSchema> = {
  [K in keyof S["properties"]]: S["properties"][K] extends OptionalSchema
    ? Static<S["properties"][K]["schema"]> | undefined
    : S["properties"][K] extends { options: { optional: true } }
      ? Static<S["properties"][K]> | undefined
      : S["properties"][K] extends { options: { required: false } }
        ? Static<S["properties"][K]> | undefined
        : Static<S["properties"][K]>;
};

/**
 * Infer TypeScript type from RefSchema
 * Always returns string (IRI)
 */
type InferRef = string;

/**
 * Infer TypeScript type from LiteralSchema
 */
type InferLiteral<S extends LiteralSchema> = S["value"];

/**
 * Infer TypeScript type from OptionalSchema
 */
type InferOptional<S extends OptionalSchema> = Static<S["schema"]> | undefined;

/**
 * Static type inference from resource schema
 * Similar to TypeBox's Static<T>
 *
 * @example
 * ```ts
 * const Person = Resource.Object({
 *   name: Resource.String(),
 *   age: Resource.Number({ optional: true })
 * })
 *
 * type PersonType = Resource.Static<typeof Person>
 * // → { name: string; age?: number | undefined }
 * ```
 */
export type Static<S extends AnyResourceSchema> = S extends StringSchema
  ? InferString
  : S extends NumberSchema
    ? InferNumber
    : S extends BooleanSchema
      ? InferBoolean
      : S extends ArraySchema
        ? InferArray<S>
        : S extends ObjectSchema
          ? InferObject<S>
          : S extends RefSchema
            ? InferRef
            : S extends LiteralSchema
              ? InferLiteral<S>
              : S extends OptionalSchema
                ? InferOptional<S>
                : never;
