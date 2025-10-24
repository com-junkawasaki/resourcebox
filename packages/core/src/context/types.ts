// DAG: core-context
// JSON-LD Context types

/**
 * JSON-LD term definition.
 * 
 * @see https://www.w3.org/TR/json-ld11/#context-definitions
 */
export interface JsonLdTermDefinition {
  /**
   * IRI that the term maps to.
   */
  readonly "@id": string;
  
  /**
   * Type of the value (for literals) or "@id" for IRI references.
   */
  readonly "@type"?: string | "@id";
  
  /**
   * Whether this term represents a container (e.g., @set, @list).
   */
  readonly "@container"?: "@set" | "@list" | "@language" | "@index" | "@id" | "@type";
  
  /**
   * Language tag for literal values.
   */
  readonly "@language"?: string;
}

/**
 * JSON-LD context value: either a string (IRI alias) or a term definition.
 */
export type JsonLdContextValue = string | JsonLdTermDefinition;

/**
 * JSON-LD context map.
 */
export interface JsonLdContextMap {
  readonly [term: string]: JsonLdContextValue;
}

/**
 * Complete JSON-LD context structure.
 * 
 * @example
 * ```json
 * {
 *   "@context": {
 *     "ex": "http://example.org/",
 *     "xsd": "http://www.w3.org/2001/XMLSchema#",
 *     "Person": "ex:Person",
 *     "email": {
 *       "@id": "ex:hasEmail",
 *       "@type": "xsd:string"
 *     },
 *     "manager": {
 *       "@id": "ex:hasManager",
 *       "@type": "@id"
 *     }
 *   }
 * }
 * ```
 */
export interface JsonLdContext {
  readonly "@context": JsonLdContextMap;
}

/**
 * Options for building JSON-LD context.
 */
export interface BuildContextOptions {
  /**
   * Include namespace prefix declarations (e.g., "ex": "http://example.org/").
   * Default: false (assumes prefixes are already defined externally).
   */
  readonly includeNamespaces?: boolean;
  
  /**
   * Namespace map (prefix -> URI).
   * Only used if includeNamespaces is true.
   */
  readonly namespaces?: Record<string, string>;
  
  /**
   * Include class term definitions (e.g., "Person": "ex:Person").
   * Default: true.
   */
  readonly includeClasses?: boolean;
  
  /**
   * Include property term definitions.
   * Default: true.
   */
  readonly includeProperties?: boolean;
}

