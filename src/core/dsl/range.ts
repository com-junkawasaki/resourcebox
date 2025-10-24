// DAG: core-api
// Range helper functions for creating range constraints

import type { IRI } from "../types/iri.ts";
import type { Range } from "../types/range.ts";

/**
 * Create a datatype range (for literal properties).
 *
 * @param datatypeIri - Datatype IRI (e.g., xsd:string, xsd:integer)
 * @returns Range with kind="datatype"
 *
 * @example
 * ```ts
 * import { datatypeIri } from "./iri.ts";
 *
 * const stringRange = range.datatype(datatypeIri("xsd:string"));
 * const intRange = range.datatype(datatypeIri("xsd:integer"));
 * ```
 */
function datatype(datatypeIri: IRI<"Datatype">): Range {
  return { kind: "datatype", datatype: datatypeIri };
}

/**
 * Create a shape range (for IRI reference properties).
 *
 * @param shapeId - Shape ID to reference (e.g., "ex:Person")
 * @returns Range with kind="shape"
 *
 * @example
 * ```ts
 * const managerRange = range.shape("ex:Person");
 * const projectRange = range.shape("ex:Project");
 * ```
 */
function shape(shapeId: string): Range {
  return { kind: "shape", shapeId };
}

/**
 * Range DSL namespace.
 * Provides helper functions for creating range constraints.
 *
 * @example
 * ```ts
 * import { range } from "@gftdcojp/shapebox-core";
 *
 * // Literal property
 * const emailRange = range.datatype(iri("xsd:string"));
 *
 * // IRI reference property
 * const managerRange = range.shape("ex:Person");
 * ```
 */
export const range = {
  datatype,
  shape,
} as const;
