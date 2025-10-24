

# Shapebox

**TypeBox-based RDF/OWL/SHACL-lite shape validation library for TypeScript**

Shapebox provides compile-time type safety and runtime validation for RDF/JSON-LD data, bridging the gap between TypeScript's type system and semantic web technologies.

## Purpose / Scope

### ✅ What Shapebox Does

* **Type-safe shape definitions**: Define RDF/OWL/SHACL-lite shapes using TypeBox with compile-time type checking
* **Structure validation**: Ajv-based validation of JSON-LD node structure (types, formats, required fields)
* **Shape validation**: ShEx-like local node validation (cardinality, range constraints, @type membership)
* **JSON-LD context generation**: Automatically generate `@context` from shape definitions for Comunica/GraphQL-LD
* **Ingestion hygiene**: Ensure only valid, consistent data enters your triplestore (Neptune, etc.)

### ❌ What Shapebox Does NOT Do

* **OWL reasoning**: No inference, transitive closure, or TBox/ABox reasoning (use Neptune or OWL reasoner)
* **Data querying**: No SPARQL execution or data fetching (use Comunica + GraphQL-LD)
* **External validation**: No checking if referenced IRIs exist (no I/O, purely local validation)
* **Global consistency**: No cross-graph or federated validation

## Architecture

```
               ┌──────────────┐
               │   shapebox   │
               │  (this lib)  │
               └─────┬────────┘
                     │  defineShape(...)
        ┌────────────┼─────────────────────────┐
        │            │                         │
        ▼            ▼                         ▼
  1. Metadata    2. Validation             3. Context
  (RDF/OWL/      (Ajv + ShEx)              (JSON-LD)
   SHACL-lite)                              
        │            │                         │
        └────────────┴─────────────────────────┘
                     │
                     ▼
               Neptune / RDF Store

---------------------------------

     (別ライブラリ / 別層)
       Comunica + GraphQL-LD
       Nexus GraphQL API
```

## Installation

```bash
pnpm add @gftdcojp/shapebox-core @gftdcojp/shapebox-validate
```

## Quick Start

### 1. Define a Shape

```typescript
import { Type } from "@sinclair/typebox";
import { defineShape, iri, cardinality, range } from "@gftdcojp/shapebox-core";

const Person = defineShape({
  classIri: iri("ex:Person"),
  
  // TypeBox schema (structure)
  schema: Type.Object({
    "@id": Type.String({ format: "uri" }),
    "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
    email: Type.String({ format: "email" }),
    manager: Type.Optional(Type.String({ format: "uri" })),
  }),
  
  // RDF/OWL/SHACL-lite metadata
  props: {
    email: {
      predicate: iri("ex:hasEmail"),
      cardinality: cardinality({ min: 1, max: 1, required: true }),
      range: range.datatype(iri("xsd:string")),
    },
    manager: {
      predicate: iri("ex:hasManager"),
      cardinality: cardinality({ min: 0, max: 1, required: false }),
      range: range.shape("ex:Person"),
    },
  },
  
  extends: [iri("ex:Agent")],
  description: "A person entity",
});
```

### 2. Generate JSON-LD Context

```typescript
import { buildContext } from "@gftdcojp/shapebox-core";

const context = buildContext([Person], {
  includeNamespaces: true,
  namespaces: {
    ex: "http://example.org/",
    xsd: "http://www.w3.org/2001/XMLSchema#",
  },
});

// Result:
// {
//   "@context": {
//     "ex": "http://example.org/",
//     "xsd": "http://www.w3.org/2001/XMLSchema#",
//     "Person": "ex:Person",
//     "email": { "@id": "ex:hasEmail", "@type": "xsd:string" },
//     "manager": { "@id": "ex:hasManager", "@type": "@id" }
//   }
// }
```

### 3. Validate Data

```typescript
import { validateStruct, validateShape } from "@gftdcojp/shapebox-validate";

const data = {
  "@id": "ex:john",
  "@type": ["ex:Person"],
  email: "john@example.com",
  manager: "ex:jane",
};

// Structure validation (Ajv-based)
const structResult = validateStruct(Person, data);
if (!structResult.ok) {
  console.error("Structure errors:", structResult.errors);
}

// Shape validation (ShEx-like)
const shapeResult = validateShape(Person, data);
if (!shapeResult.ok) {
  console.error("Shape violations:", shapeResult.violations);
}
```

## Compile-Time Type Safety

Shapebox enforces consistency at **compile time** using TypeScript's type system:

### ❌ Cardinality vs Optional Mismatch

```typescript
// ERROR: required=true but schema is Optional
defineShape({
  classIri: iri("ex:Person"),
  schema: Type.Object({
    email: Type.Optional(Type.String()), // ❌ Optional
  }),
  props: {
    email: {
      cardinality: cardinality({ min: 1, max: 1, required: true }), // ❌ required=true
      // ...
    },
  },
});
// TypeScript error: Property 'email' has cardinality.required=true but schema is Optional
```

### ❌ Props-Schema Key Mismatch

```typescript
// ERROR: 'age' in props but not in schema
defineShape({
  schema: Type.Object({
    email: Type.String(),
  }),
  props: {
    email: { /* ... */ },
    age: { /* ... */ }, // ❌ 'age' not in schema
  },
});
// TypeScript error: Property 'age' does not exist in schema
```

### ❌ Circular Inheritance

```typescript
// ERROR: Person extends itself
defineShape({
  classIri: iri("ex:Person"),
  extends: [iri("ex:Person")], // ❌ Self-reference
  // ...
});
// TypeScript error: Class 'ex:Person' extends itself (circular reference)
```

## Runtime Validation

### Structure Validation (validateStruct)

Checks JSON-LD structure using Ajv:
- Property types (string, number, boolean, array, object)
- Format constraints (email, uri, date-time, etc.)
- Required vs optional properties
- Array constraints (minItems, maxItems)

### Shape Validation (validateShape)

Checks RDF/SHACL-lite constraints:
- **@type membership**: Node must have the shape's class IRI in `@type`
- **Cardinality**: Min/max occurrence counts, required properties
- **Range**: Datatype (literal) vs shape (IRI reference)

## Integration with Query Layer

Shapebox is designed to integrate with **Comunica + GraphQL-LD** for data querying:

1. **Shapebox** generates `@context` from shapes
2. **Comunica + GraphQL-LD** uses `@context` to translate GraphQL queries to SPARQL
3. **Nexus** provides GraphQL API (edge layer)

This separation allows:
- **Shapebox**: Focus on ingestion hygiene and validation
- **Comunica**: Handle query translation and execution
- No need to build custom SPARQL DSL (unless advanced UPDATE operations are needed)

## Packages

| Package | Description |
|---------|-------------|
| `@gftdcojp/shapebox-core` | Core types, DSL API, and JSON-LD context generation |
| `@gftdcojp/shapebox-validate` | Runtime validation (Ajv + ShEx-like shape checking) |

## Examples

See `examples/` directory for complete examples:
- `person.ts`: Person shape definition
- `project.ts`: Project shape with array properties
- `usage.ts`: Complete validation workflow

## Design Principles

### 1. Single Source of Truth (SSoT)

Shape definitions are the **only** source for:
- TypeScript types (via TypeBox)
- JSON-LD context (via `buildContext`)
- RDF/OWL/SHACL-lite semantics (via `props`)
- Validation rules (structure + shape)

### 2. Compile-Time Safety

Type-level checks prevent:
- Cardinality-optional inconsistencies
- Props-schema key mismatches
- Circular inheritance (1 level)
- Range constraint violations

### 3. No External I/O

All validation is **pure** (no side effects):
- No checking if IRIs exist
- No fetching external data
- No network calls

Future `@gftdcojp/shapebox-effect` can handle I/O-based validation separately.

### 4. Separation of Concerns

- **Ingestion** (shapebox): Ensure data validity before entering the triplestore
- **Reasoning** (Neptune/OWL reasoner): Infer new facts, transitive closure
- **Querying** (Comunica + GraphQL-LD): Fetch and transform data

## Entropy Minimization

Shapebox follows **information entropy minimization** principles:

1. **Vocabulary Consistency**: IRIs are the single source, no duplicate definitions
2. **Structural Constraints**: TypeBox + SHACL-lite reduce ambiguity in data shapes
3. **Type Safety**: Compile-time checks eliminate invalid configurations
4. **Local Validation**: ShEx-like shape checking ensures node-level consistency

This approach reduces uncertainty at **ingestion time**, preventing invalid data from propagating through the system.

## License

Apache 2.0

Copyright 2025 GFTD Co., JP

## References

- **TypeBox**: https://github.com/sinclairzx81/typebox
- **JSON-LD**: https://www.w3.org/TR/json-ld11/
- **SHACL**: https://www.w3.org/TR/shacl/
- **ShEx**: https://shex.io/
- **Comunica**: https://comunica.dev/
- **GraphQL-LD**: https://github.com/rubensworks/graphql-ld.js

---

**Shapebox** = TypeBox 拡張 + RDF/OWL-lite/SHACL-lite + JSON-LD Context 生成 + ShEx的検証

型安全な意味メタデータと構造検証を統合。

