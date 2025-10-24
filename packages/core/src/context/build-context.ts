// DAG: core-context
// buildContext: generate JSON-LD context from Shape definitions

import type { Shape } from "../types/shape.ts";
import type { PropertyMeta } from "../types/property.ts";
import { getIRILocalName } from "../types/iri.ts";
import type {
  JsonLdContext,
  JsonLdContextMap,
  BuildContextOptions,
} from "./types.ts";

/**
 * Build a JSON-LD @context from Shape definitions.
 * 
 * This function generates a JSON-LD context that maps:
 * - Class names to class IRIs (e.g., "Person" -> "ex:Person")
 * - Property names to property IRIs with type information
 * 
 * The generated context can be used for:
 * - Serializing/deserializing JSON-LD data
 * - GraphQL-LD query translation (with Comunica)
 * - Providing IRI aliases in client code
 * 
 * @param shapes - Array of Shape definitions
 * @param options - Build options
 * @returns JSON-LD context object
 * 
 * @example
 * ```ts
 * import { buildContext } from "@gftdcojp/shapebox-core";
 * 
 * const context = buildContext([Person, Project]);
 * 
 * // Result:
 * // {
 * //   "@context": {
 * //     "Person": "ex:Person",
 * //     "Project": "ex:Project",
 * //     "email": { "@id": "ex:hasEmail", "@type": "xsd:string" },
 * //     "manager": { "@id": "ex:hasManager", "@type": "@id" },
 * //     ...
 * //   }
 * // }
 * ```
 */
export function buildContext(
  shapes: ReadonlyArray<Shape>,
  options: BuildContextOptions = {}
): JsonLdContext {
  const {
    includeNamespaces = false,
    namespaces = {},
    includeClasses = true,
    includeProperties = true,
  } = options;
  
  const contextMap: Record<string, unknown> = {};
  
  // 1. Add namespace declarations if requested
  if (includeNamespaces) {
    for (const [prefix, uri] of Object.entries(namespaces)) {
      contextMap[prefix] = uri;
    }
  }
  
  // 2. Add class term definitions
  if (includeClasses) {
    for (const shape of shapes) {
      const className = getIRILocalName(shape.classIri);
      contextMap[className] = shape.classIri;
    }
  }
  
  // 3. Add property term definitions
  if (includeProperties) {
    for (const shape of shapes) {
      for (const [propName, propMeta] of Object.entries(shape.props)) {
        // Skip JSON-LD special properties
        if (propName === "@id" || propName === "@type" || propName === "@context") {
          continue;
        }
        
        if (propMeta) {
          contextMap[propName] = buildPropertyTermDefinition(propMeta);
        }
      }
    }
  }
  
  return {
    "@context": contextMap as JsonLdContextMap,
  };
}

/**
 * Build a JSON-LD term definition for a property.
 * 
 * @param propMeta - Property metadata
 * @returns JSON-LD term definition
 * 
 * @internal
 */
function buildPropertyTermDefinition(propMeta: PropertyMeta): JsonLdContextMap[string] {
  const termDef: Record<string, unknown> = {
    "@id": propMeta.predicate,
  };
  
  // Set @type based on range
  if (propMeta.range.kind === "datatype") {
    termDef["@type"] = propMeta.range.datatype;
  } else if (propMeta.range.kind === "shape") {
    termDef["@type"] = "@id"; // IRI reference
  }
  
  return termDef as JsonLdContextMap[string];
}

/**
 * Merge multiple JSON-LD contexts into one.
 * 
 * Later contexts take precedence over earlier ones in case of conflicts.
 * 
 * @param contexts - Array of JSON-LD contexts to merge
 * @returns Merged JSON-LD context
 * 
 * @example
 * ```ts
 * const context1 = buildContext([Person]);
 * const context2 = buildContext([Project]);
 * const merged = mergeContexts([context1, context2]);
 * ```
 */
export function mergeContexts(contexts: ReadonlyArray<JsonLdContext>): JsonLdContext {
  const merged: Record<string, unknown> = {};
  
  for (const context of contexts) {
    Object.assign(merged, context["@context"]);
  }
  
  return {
    "@context": merged as JsonLdContextMap,
  };
}

/**
 * Extract namespace prefixes from a set of shapes.
 * 
 * This is a helper for generating namespace declarations.
 * It scans all IRIs in the shapes and extracts unique prefixes.
 * 
 * @param shapes - Array of Shape definitions
 * @returns Set of unique namespace prefixes
 * 
 * @example
 * ```ts
 * const prefixes = extractNamespacePrefixes([Person, Project]);
 * // Set { "ex", "xsd", "foaf" }
 * ```
 */
export function extractNamespacePrefixes(shapes: ReadonlyArray<Shape>): Set<string> {
  const prefixes = new Set<string>();
  
  for (const shape of shapes) {
    // Extract from classIri
    const classPrefix = extractPrefix(shape.classIri);
    if (classPrefix) prefixes.add(classPrefix);
    
    // Extract from parent classes
    if (shape.extends) {
      for (const parentIri of shape.extends) {
        const parentPrefix = extractPrefix(parentIri);
        if (parentPrefix) prefixes.add(parentPrefix);
      }
    }
    
    // Extract from properties
    for (const propMeta of Object.values(shape.props)) {
      if (propMeta) {
        const propPrefix = extractPrefix(propMeta.predicate);
        if (propPrefix) prefixes.add(propPrefix);
        
        if (propMeta.range.kind === "datatype") {
          const datatypePrefix = extractPrefix(propMeta.range.datatype);
          if (datatypePrefix) prefixes.add(datatypePrefix);
        }
      }
    }
  }
  
  return prefixes;
}

/**
 * Extract namespace prefix from an IRI.
 * 
 * @param iri - IRI string
 * @returns Prefix (e.g., "ex" from "ex:Person"), or undefined for full URIs
 * 
 * @internal
 */
function extractPrefix(iri: string): string | undefined {
  if (iri.startsWith("http://") || iri.startsWith("https://") || iri.startsWith("urn:")) {
    return undefined;
  }
  const colonIndex = iri.indexOf(":");
  return colonIndex > 0 ? iri.slice(0, colonIndex) : undefined;
}

