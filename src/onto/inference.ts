// RDFS inference utilities (lightweight closure for SHACL validation)

// RDFS + OWL Lite rules for lightweight inference (no full reasoning)
export const RDFS_RULES = {
  // rdfs:subClassOf transitivity
  subClassOfTransitive: true,
  // rdfs:subPropertyOf transitivity
  subPropertyOfTransitive: true,
  // rdfs:domain/range inference
  domainRangeInference: true,
  // rdfs:subClassOf → rdfs:subPropertyOf inheritance (limited)
  classToPropertyInheritance: false, // Too complex for lightweight
} as const;

// OWL Lite rules for lightweight inference
export const OWL_LITE_RULES = {
  // owl:equivalentClass support
  equivalentClass: true,
  // owl:inverseOf support
  inverseOf: true,
  // owl:FunctionalProperty support (limited)
  functionalProperty: false, // Complex for lightweight
} as const;

/**
 * Lightweight RDFS + OWL Lite inference context
 */
export interface InferenceContext {
  readonly classes: Map<string, Set<string>>; // class IRI → set of superclasses
  readonly properties: Map<string, Set<string>>; // property IRI → set of superproperties
  readonly domains: Map<string, Set<string>>; // property IRI → set of domain classes
  readonly ranges: Map<string, Set<string>>; // property IRI → set of range classes
  // OWL Lite extensions
  readonly equivalentClasses: Map<string, Set<string>>; // class IRI → set of equivalent classes
  readonly inverseProperties: Map<string, string>; // property IRI → inverse property IRI
}

/**
 * Create inference context from ontology definitions
 * Note: This is a lightweight closure, not full OWL reasoning
 */
export function createInferenceContext(
  classDefs: ReadonlyArray<{
    iri: string;
    superClasses?: ReadonlyArray<string>;
    equivalentClasses?: ReadonlyArray<string>;
  }>,
  propertyDefs: ReadonlyArray<{
    iri: string;
    superProperties?: ReadonlyArray<string>;
    domain?: ReadonlyArray<string>;
    range?: ReadonlyArray<string>;
    inverseOf?: string;
  }>
): InferenceContext {
  const classes = new Map<string, Set<string>>();
  const properties = new Map<string, Set<string>>();
  const domains = new Map<string, Set<string>>();
  const ranges = new Map<string, Set<string>>();
  const equivalentClasses = new Map<string, Set<string>>();
  const inverseProperties = new Map<string, string>();

  // Initialize classes
  for (const def of classDefs) {
    classes.set(def.iri, new Set(def.superClasses || []));
    if (def.equivalentClasses) {
      equivalentClasses.set(def.iri, new Set(def.equivalentClasses));
      // Also add reverse equivalences
      for (const eq of def.equivalentClasses) {
        if (!equivalentClasses.has(eq)) {
          equivalentClasses.set(eq, new Set());
        }
        equivalentClasses.get(eq)?.add(def.iri);
      }
    }
  }

  // Initialize properties
  for (const def of propertyDefs) {
    properties.set(def.iri, new Set(def.superProperties || []));
    if (def.domain) {
      domains.set(def.iri, new Set(def.domain));
    }
    if (def.range) {
      ranges.set(def.iri, new Set(def.range));
    }
    if (def.inverseOf) {
      inverseProperties.set(def.iri, def.inverseOf);
      inverseProperties.set(def.inverseOf, def.iri);
    }
  }

  // Apply RDFS transitivity (simple closure)
  if (RDFS_RULES.subClassOfTransitive) {
    closeTransitive(classes);
  }
  if (RDFS_RULES.subPropertyOfTransitive) {
    closeTransitive(properties);
  }

  // Domain/range inheritance from superproperties
  if (RDFS_RULES.domainRangeInference) {
    for (const [prop, supers] of properties) {
      const domainSet = domains.get(prop) || new Set<string>();
      const rangeSet = ranges.get(prop) || new Set<string>();

      for (const superProp of supers) {
        const superDomains = domains.get(superProp);
        const superRanges = ranges.get(superProp);
        if (superDomains) {
          for (const d of superDomains) {
            domainSet.add(d);
          }
        }
        if (superRanges) {
          for (const r of superRanges) {
            rangeSet.add(r);
          }
        }
      }

      if (domainSet.size > 0) domains.set(prop, domainSet);
      if (rangeSet.size > 0) ranges.set(prop, rangeSet);
    }
  }

  return { classes, properties, domains, ranges, equivalentClasses, inverseProperties };
}

/**
 * Check if a class is a subclass of another (including transitivity)
 */
export function isSubClassOf(
  context: InferenceContext,
  subClass: string,
  superClass: string
): boolean {
  const supers = context.classes.get(subClass);
  return supers?.has(superClass) || subClass === superClass || false;
}

/**
 * Check if a property is a subproperty of another (including transitivity)
 */
export function isSubPropertyOf(
  context: InferenceContext,
  subProp: string,
  superProp: string
): boolean {
  const supers = context.properties.get(subProp);
  return supers?.has(superProp) || subProp === superProp || false;
}

/**
 * Get all superclasses of a class (including itself)
 */
export function getAllSuperClasses(context: InferenceContext, classIri: string): Set<string> {
  const result = new Set<string>([classIri]);
  const supers = context.classes.get(classIri);
  if (supers) {
    for (const superClass of supers) {
      result.add(superClass);
      // Recursive addition
      const deeper = getAllSuperClasses(context, superClass);
      for (const c of deeper) {
        result.add(c);
      }
    }
  }
  return result;
}

/**
 * Check if two classes are equivalent (OWL Lite)
 */
export function areEquivalentClasses(
  context: InferenceContext,
  class1: string,
  class2: string
): boolean {
  if (!OWL_LITE_RULES.equivalentClass) return false;
  if (class1 === class2) return true;

  // Get all equivalent classes for class1 (transitive closure)
  const visited = new Set<string>();
  const queue = [class1];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const equivalents = context.equivalentClasses.get(current);
    if (equivalents) {
      for (const eq of equivalents) {
        if (eq === class2) return true;
        if (!visited.has(eq)) {
          queue.push(eq);
        }
      }
    }
  }

  return false;
}

/**
 * Get the inverse property of a given property (OWL Lite)
 */
export function getInverseProperty(
  context: InferenceContext,
  propertyIri: string
): string | undefined {
  if (!OWL_LITE_RULES.inverseOf) return undefined;
  return context.inverseProperties.get(propertyIri);
}

/**
 * Check if a value matches a property's range (for SHACL validation)
 */
export function matchesRange(
  context: InferenceContext,
  propertyIri: string,
  valueType: string
): boolean {
  const ranges = context.ranges.get(propertyIri);
  if (!ranges) return true; // No range constraint

  for (const range of ranges) {
    if (isSubClassOf(context, valueType, range)) {
      return true;
    }
  }
  return false;
}

// Helper: Apply transitive closure to a map of IRI → Set<IRI>
function closeTransitive(relations: Map<string, Set<string>>): void {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [iri, currentSupers] of relations) {
      const newSupers = new Set(currentSupers);
      for (const superIri of currentSupers) {
        const deeperSupers = relations.get(superIri);
        if (deeperSupers) {
          for (const deeper of deeperSupers) {
            if (!newSupers.has(deeper)) {
              newSupers.add(deeper);
              changed = true;
            }
          }
        }
      }
      relations.set(iri, newSupers);
    }
  }
}
