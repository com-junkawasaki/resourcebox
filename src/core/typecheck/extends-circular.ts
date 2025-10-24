// DAG: core-typecheck
// Compile-time check: detect circular extends (1 level)

import type { IRI } from "../types/iri.ts";

/**
 * Check if a class IRI appears in its own extends list (direct self-reference).
 *
 * This is a 1-level circular dependency check. More complex cycles (A -> B -> A)
 * are not checked at compile time and should be detected by a lint tool.
 *
 * @template TClassIri - The class IRI being defined
 * @template TExtends - Array of parent class IRIs
 *
 * @returns never if circular, void if acyclic
 *
 * @example
 * ```ts
 * // ❌ ERROR: Person extends itself
 * type Invalid = ValidateExtendsCircular<
 *   IRI<"ex:Person">,
 *   [IRI<"ex:Person">, IRI<"ex:Agent">]
 * >; // never
 *
 * // ✅ OK: Person extends Agent (no self-reference)
 * type Valid = ValidateExtendsCircular<
 *   IRI<"ex:Person">,
 *   [IRI<"ex:Agent">]
 * >; // void
 * ```
 */
export type ValidateExtendsCircular<
  TClassIri extends IRI<"Class">,
  TExtends extends ReadonlyArray<IRI<"Class">>,
> = TClassIri extends TExtends[number]
  ? never // Error: class extends itself
  : void;

/**
 * Runtime check for direct circular extends.
 *
 * @param classIri - The class IRI being defined
 * @param extendsArray - Array of parent class IRIs
 * @returns Error message if circular, undefined if acyclic
 */
export function validateExtendsCircularRuntime(
  classIri: IRI<"Class">,
  extendsArray: ReadonlyArray<IRI<"Class">> | undefined
): string | undefined {
  if (!extendsArray || extendsArray.length === 0) {
    return undefined;
  }

  if (extendsArray.includes(classIri)) {
    return `Class ${classIri} cannot extend itself (circular reference)`;
  }

  return undefined;
}

/**
 * Error message type for circular extends.
 */
export type ExtendsCircularError<TClassIri extends IRI<"Class">> =
  `Class '${TClassIri}' extends itself. Circular inheritance is not allowed.`;
