// Resource.Literal - Constant/literal values

import type { LiteralSchema } from "./types.js";

/**
 * Create a Literal (constant value) resource schema
 * Used for fixed values like @type
 *
 * @example
 * ```ts
 * Resource.Literal(["foaf:Person"])
 * Resource.Literal("active")
 * Resource.Literal(42)
 * ```
 */
export function Literal<T>(value: T): LiteralSchema<T> {
  return {
    kind: "Literal",
    value,
  };
}
