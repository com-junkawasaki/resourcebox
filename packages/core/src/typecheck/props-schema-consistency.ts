// DAG: core-typecheck
// Compile-time check: props keys must exist in schema (except @id, @type, @context)

import type { TProperties } from "@sinclair/typebox";

/**
 * Special JSON-LD keys that don't need PropertyMeta.
 */
type JsonLdSpecialKeys = "@id" | "@type" | "@context";

/**
 * Valid property keys: all schema keys except JSON-LD special keys.
 */
type ValidPropertyKeys<TProps extends TProperties> = Exclude<keyof TProps, JsonLdSpecialKeys>;

/**
 * Check if all keys in TMetas exist in TProps (ignoring JSON-LD special keys).
 * 
 * @template TProps - Properties from TypeBox schema
 * @template TMetas - Property metadata map
 * 
 * @returns never if any key in TMetas is not in TProps, void if consistent
 * 
 * @example
 * ```ts
 * // ✅ OK: email and name are in schema
 * type Valid = ValidatePropsSchemaConsistency<
 *   { "@id": TString; email: TString; name: TString },
 *   { email: PropertyMeta; name: PropertyMeta }
 * >; // void
 * 
 * // ❌ ERROR: age is in props but not in schema
 * type Invalid = ValidatePropsSchemaConsistency<
 *   { "@id": TString; email: TString },
 *   { email: PropertyMeta; age: PropertyMeta }
 * >; // never
 * ```
 */
export type ValidatePropsSchemaConsistency<
  TProps extends TProperties,
  TMetas extends Record<string, unknown>,
> = {
  [K in keyof TMetas]: K extends ValidPropertyKeys<TProps>
    ? void
    : K extends JsonLdSpecialKeys
      ? void // Allow (but ignore) JSON-LD special keys in props
      : never; // Error: key in props but not in schema
};

/**
 * Extract keys from TMetas that are not in TProps.
 * Used for generating helpful error messages.
 * 
 * @template TProps - Properties from TypeBox schema
 * @template TMetas - Property metadata map
 */
export type ExtraPropsKeys<
  TProps extends TProperties,
  TMetas extends Record<string, unknown>,
> = Exclude<keyof TMetas, ValidPropertyKeys<TProps> | JsonLdSpecialKeys>;

/**
 * Error message type for props-schema inconsistency.
 */
export type PropsSchemaConsistencyError<TExtraKeys extends string> =
  `Property metadata keys [${TExtraKeys}] do not exist in schema. Remove them or add corresponding schema properties.`;

/**
 * Runtime check for props-schema consistency.
 * 
 * @param schemaKeys - Keys from TypeBox schema
 * @param propsKeys - Keys from property metadata map
 * @returns Error message if inconsistent, undefined if consistent
 */
export function validatePropsSchemaConsistencyRuntime(
  schemaKeys: string[],
  propsKeys: string[]
): string | undefined {
  const validSchemaKeys = new Set(
    schemaKeys.filter((k) => k !== "@id" && k !== "@type" && k !== "@context")
  );
  
  const extraKeys = propsKeys.filter(
    (k) => !validSchemaKeys.has(k) && k !== "@id" && k !== "@type" && k !== "@context"
  );
  
  if (extraKeys.length > 0) {
    return `Property metadata keys [${extraKeys.join(", ")}] do not exist in schema`;
  }
  
  return undefined;
}

