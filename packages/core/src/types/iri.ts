// DAG: core-types
// IRI branded type for compile-time IRI safety

/**
 * IRI (Internationalized Resource Identifier) branded type.
 * 
 * This type provides compile-time safety for IRI strings, preventing
 * accidental usage of plain strings where IRIs are expected.
 * 
 * @template T - Optional semantic tag for the IRI (e.g., "Class", "Property")
 * 
 * @example
 * ```ts
 * const personIri: IRI<"Class"> = iri("ex:Person");
 * const emailIri: IRI<"Property"> = iri("ex:hasEmail");
 * ```
 */
export type IRI<T extends string = string> = string & { readonly __brand: "IRI"; readonly __tag: T };

/**
 * Type guard to check if a value is an IRI.
 * Note: This only checks the string format at runtime, not the brand.
 * 
 * @param value - Value to check
 * @returns True if value is a string that looks like an IRI
 */
export function isIRI(value: unknown): value is IRI {
  return typeof value === "string" && (
    value.includes(":") || // Prefixed IRI (ex:Person)
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("urn:")
  );
}

/**
 * Extract the namespace prefix from an IRI.
 * 
 * @param iri - IRI to extract prefix from
 * @returns Namespace prefix (e.g., "ex" from "ex:Person"), or undefined for full URIs
 * 
 * @example
 * ```ts
 * getIRIPrefix(iri("ex:Person")); // "ex"
 * getIRIPrefix(iri("http://example.org/Person")); // undefined
 * ```
 */
export function getIRIPrefix(iri: IRI): string | undefined {
  if (iri.startsWith("http://") || iri.startsWith("https://") || iri.startsWith("urn:")) {
    return undefined;
  }
  const colonIndex = iri.indexOf(":");
  return colonIndex > 0 ? iri.slice(0, colonIndex) : undefined;
}

/**
 * Extract the local name from an IRI.
 * 
 * @param iri - IRI to extract local name from
 * @returns Local name (e.g., "Person" from "ex:Person" or "http://example.org/Person")
 * 
 * @example
 * ```ts
 * getIRILocalName(iri("ex:Person")); // "Person"
 * getIRILocalName(iri("http://example.org/ont#Person")); // "Person"
 * ```
 */
export function getIRILocalName(iri: IRI): string {
  // For full URIs, extract after last # or /
  if (iri.startsWith("http://") || iri.startsWith("https://")) {
    const hashIndex = iri.lastIndexOf("#");
    if (hashIndex > 0) return iri.slice(hashIndex + 1);
    const slashIndex = iri.lastIndexOf("/");
    if (slashIndex > 0) return iri.slice(slashIndex + 1);
    return iri;
  }
  
  // For prefixed IRIs, extract after colon
  const colonIndex = iri.indexOf(":");
  return colonIndex > 0 ? iri.slice(colonIndex + 1) : iri;
}

