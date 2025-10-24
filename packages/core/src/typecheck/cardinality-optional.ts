// DAG: core-typecheck
// Compile-time check: cardinality.required=true <=> schema property is not Optional

import type { TOptional, TProperties, TSchema } from "@sinclair/typebox";
import type { Cardinality } from "../types/cardinality.ts";

/**
 * Check if a TypeBox schema is Optional.
 * 
 * @internal
 */
type IsOptional<T extends TSchema> = T extends TOptional<infer _U> ? true : false;

/**
 * Validate that required cardinality matches schema optionality.
 * 
 * If cardinality.required = true, the schema MUST NOT be Optional.
 * If cardinality.required = false, the schema CAN be either Optional or not (more permissive).
 * 
 * @template TCard - Cardinality type
 * @template TSchema - TypeBox schema type
 * 
 * @returns never if inconsistent, void if consistent
 * 
 * @example
 * ```ts
 * // ✅ OK: required=true, schema is NOT Optional
 * type Valid1 = ValidateCardinalityOptional<
 *   { min: 1; max: 1; required: true },
 *   TString
 * >; // void
 * 
 * // ❌ ERROR: required=true, schema IS Optional
 * type Invalid = ValidateCardinalityOptional<
 *   { min: 1; max: 1; required: true },
 *   TOptional<TString>
 * >; // never
 * 
 * // ✅ OK: required=false, schema is Optional
 * type Valid2 = ValidateCardinalityOptional<
 *   { min: 0; max: 1; required: false },
 *   TOptional<TString>
 * >; // void
 * 
 * // ✅ OK: required=false, schema is NOT Optional (more permissive)
 * type Valid3 = ValidateCardinalityOptional<
 *   { min: 0; max: 1; required: false },
 *   TString
 * >; // void
 * ```
 */
export type ValidateCardinalityOptional<
  TCard extends Cardinality,
  TSchemaType extends TSchema,
> = TCard["required"] extends true
  ? IsOptional<TSchemaType> extends true
    ? never // Error: required=true but schema is Optional
    : void
  : void; // required=false allows both Optional and non-Optional

/**
 * Validate all properties' cardinality-optional consistency.
 * 
 * @template TProps - Properties from schema
 * @template TMetas - Property metadata map
 * 
 * @returns never if any inconsistency, void if all consistent
 */
export type ValidateAllCardinalityOptional<
  TProps extends TProperties,
  TMetas extends {
    readonly [K in keyof TProps]?: { readonly cardinality: Cardinality };
  },
> = {
  [K in keyof TMetas]: K extends keyof TProps
    ? TMetas[K] extends { readonly cardinality: infer TCard }
      ? TCard extends Cardinality
        ? ValidateCardinalityOptional<TCard, TProps[K]>
        : void
      : void
    : void;
};

/**
 * Error message type for cardinality-optional mismatch.
 * This type is used in error messages to guide developers.
 */
export type CardinalityOptionalError<
  PropName extends string,
  TCard extends Cardinality,
> = `Property '${PropName}' has cardinality.required=true but schema is Optional. Either set required=false or remove Optional from schema.`;

