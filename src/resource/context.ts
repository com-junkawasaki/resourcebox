// Resource.context - Generate JSON-LD context from resource schema

import { getClassIRI, isClass } from "../onto/class.js";
import { getPropertyIRI, isProperty } from "../onto/property.js";
import type { OntoIRI } from "../onto/types.js";
import type { AnyResourceSchema, ObjectSchema } from "./types.js";

/**
 * JSON-LD context value
 */
export type ContextValue = string | { "@id": string; "@type"?: string };

/**
 * JSON-LD context map
 */
export interface ContextMap {
  readonly [term: string]: ContextValue;
}

/**
 * JSON-LD context object
 */
export interface JsonLdContext {
  readonly "@context": ContextMap;
}

/**
 * Context generation options
 */
export interface ContextOptions {
  readonly includeNamespaces?: boolean;
  readonly namespaces?: Record<string, string>;
}

/**
 * Generate JSON-LD @context from resource schema
 * 
 * @example
 * ```ts
 * const Person = Resource.Object({
 *   name: Resource.String({ property: foaf("name") }),
 *   email: Resource.String({ property: foaf("mbox") })
 * }, {
 *   class: foaf("Person")
 * })
 * 
 * const context = Resource.context(Person, {
 *   includeNamespaces: true,
 *   namespaces: {
 *     foaf: "http://xmlns.com/foaf/0.1/"
 *   }
 * })
 * // → {
 * //   "@context": {
 * //     "foaf": "http://xmlns.com/foaf/0.1/",
 * //     "name": { "@id": "foaf:name" },
 * //     "email": { "@id": "foaf:mbox" }
 * //   }
 * // }
 * ```
 */
export function context(
  schema: AnyResourceSchema,
  options: ContextOptions = {}
): JsonLdContext {
  const contextMap: Record<string, ContextValue> = {};
  
  // Add namespaces if requested
  if (options.includeNamespaces && options.namespaces) {
    for (const [prefix, uri] of Object.entries(options.namespaces)) {
      contextMap[prefix] = uri;
    }
  }
  
  // Process object schema
  if (schema.kind === "Object") {
    extractContextFromObject(schema, contextMap);
  }
  
  return {
    "@context": contextMap,
  };
}

/**
 * Extract context from object schema
 */
function extractContextFromObject(schema: ObjectSchema, contextMap: Record<string, ContextValue>): void {
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // Skip JSON-LD reserved properties
    if (key === "@id" || key === "@type" || key === "@context") {
      continue;
    }
    
    // Extract property IRI
    const property = propSchema.property;
    if (!property) {
      continue;
    }
    
    const propertyIRI = isProperty(property) ? getPropertyIRI(property) : property;
    
    // Determine type based on schema kind
    if (propSchema.kind === "Ref") {
      // Reference to another resource
      contextMap[key] = {
        "@id": propertyIRI,
        "@type": "@id",
      };
    } else if (propSchema.kind === "Array") {
      // Array property
      if ("items" in propSchema && (propSchema as {items: AnyResourceSchema}).items.kind === "Ref") {
        contextMap[key] = {
          "@id": propertyIRI,
          "@type": "@id",
        };
      } else {
        contextMap[key] = { "@id": propertyIRI };
      }
    } else {
      // Simple property
      contextMap[key] = { "@id": propertyIRI };
    }
  }
}

/**
 * Helper to extract namespace prefixes from resource schema
 */
export function extractNamespaces(schema: AnyResourceSchema): Set<string> {
  const prefixes = new Set<string>();
  
  if (schema.kind === "Object") {
    // Extract from class
    if (schema.options?.class) {
      const classIRI = isClass(schema.options.class) 
        ? getClassIRI(schema.options.class)
        : schema.options.class;
      
      const prefix = extractPrefix(classIRI);
      if (prefix) {
        prefixes.add(prefix);
      }
    }
    
    // Extract from properties
    for (const propSchema of Object.values(schema.properties)) {
      if (propSchema.property) {
        const propertyIRI = isProperty(propSchema.property)
          ? getPropertyIRI(propSchema.property)
          : propSchema.property;
        
        const prefix = extractPrefix(propertyIRI);
        if (prefix) {
          prefixes.add(prefix);
        }
      }
    }
  }
  
  return prefixes;
}

/**
 * Extract prefix from IRI (e.g., "foaf:name" → "foaf")
 */
function extractPrefix(iri: OntoIRI): string | undefined {
  const colonIndex = iri.indexOf(":");
  if (colonIndex > 0 && colonIndex < iri.length - 1) {
    // Check if it's a prefixed name (not a full URI)
    if (!iri.startsWith("http://") && !iri.startsWith("https://")) {
      return iri.substring(0, colonIndex);
    }
  }
  return undefined;
}

