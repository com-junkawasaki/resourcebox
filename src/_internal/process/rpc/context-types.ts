// DAG: process-rpc
// JSON-LD context term expansion utilities for RPC bridges

import type {
  JsonLdContextMap,
  JsonLdContextValue,
  JsonLdTermDefinition,
} from "../../../core/context/types.js";

/**
 * RPC-oriented classification of JSON-LD term definitions.
 */
export type RpcTermKind =
  | { readonly kind: "namespace"; readonly iri: string }
  | { readonly kind: "class"; readonly iri: string }
  | { readonly kind: "reference"; readonly iri: string }
  | {
      readonly kind: "literal";
      readonly iri: string;
      readonly datatype?: string;
      readonly language?: string;
    };

/**
 * Expand a single JSON-LD context value into RPC metadata.
 */
export function expandContextValue(term: JsonLdContextValue): RpcTermKind {
  if (typeof term === "string") {
    return classifyStringTerm(term);
  }
  return classifyDefinitionTerm(term);
}

/**
 * Expand an entire context map into RPC metadata map.
 */
export function expandContextMap(context: JsonLdContextMap): Record<string, RpcTermKind> {
  const result: Record<string, RpcTermKind> = {};
  for (const [term, definition] of Object.entries(context)) {
    result[term] = expandContextValue(definition);
  }
  return result;
}

function classifyStringTerm(iri: string): RpcTermKind {
  if (isNamespaceDefinition(iri)) {
    return { kind: "namespace", iri };
  }
  return { kind: "class", iri };
}

function classifyDefinitionTerm(def: JsonLdTermDefinition): RpcTermKind {
  if (def["@type"] === "@id") {
    return { kind: "reference", iri: def["@id"] };
  }
  return {
    kind: "literal",
    iri: def["@id"],
    ...(def["@type"] && { datatype: def["@type"] }),
    ...(def["@language"] && { language: def["@language"] }),
  };
}

function isNamespaceDefinition(value: string): boolean {
  return value.endsWith(":") || value.endsWith("/") || value.endsWith("#");
}
