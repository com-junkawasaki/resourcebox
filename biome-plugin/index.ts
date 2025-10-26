/**
 * Biome plugin for RDF/OWL validation
 */

import type { Rule } from "@biomejs/js-api";

const rdfIriRule: Rule = {
  name: "rdf-iri-format",
  category: "lint/suspicious",
  recommended: true,

  check: (node, context) => {
    // Check for IRI-like strings that don't match proper IRI format
    if (node.type === "StringLiteral") {
      const value = node.value;

      // Check if it looks like an IRI but doesn't match IRI pattern
      if (value.includes("://") || value.startsWith("http") || value.includes("xmlns.com")) {
        const iriPattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
        if (!iriPattern.test(value)) {
          context.report({
            node,
            message: `Invalid IRI format: ${value}. IRIs should start with a valid scheme.`,
            fix: null,
          });
        }
      }
    }
  },
};

const owlStandardNamespaces: Record<string, string> = {
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "RDF",
  "http://www.w3.org/2000/01/rdf-schema#": "RDFS",
  "http://www.w3.org/2002/07/owl#": "OWL",
  "http://xmlns.com/foaf/0.1/": "FOAF",
  "http://www.w3.org/2001/XMLSchema#": "XSD",
};

const standardNamespaceUsageRule: Rule = {
  name: "owl-standard-namespace",
  category: "lint/style",
  recommended: true,

  check: (node, context) => {
    if (node.type === "StringLiteral") {
      const value = node.value;

      // Check if using hardcoded standard namespace IRI instead of imported constant
      for (const [iri, prefix] of Object.entries(owlStandardNamespaces)) {
        if (value === iri) {
          context.report({
            node,
            message: `Use imported ${prefix} constant instead of hardcoded IRI: ${iri}`,
            fix: null,
          });
        }
      }
    }
  },
};

export const rules = [rdfIriRule, standardNamespaceUsageRule];
