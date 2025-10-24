

# ResourceBox

**TypeBox-inspired RDF Resource type builder with SHACL validation and OWL ontology support for TypeScript**

ResourceBox provides compile-time type safety and runtime validation for RDF/JSON-LD data, bridging the gap between TypeScript's type system and semantic web technologies. Inspired by TypeBox's elegant API design, ResourceBox extends it to the semantic web domain.

## Purpose / Scope

### ✅ What ResourceBox Does

* **Type-safe shape definitions**: Define RDF/OWL/SHACL-lite shapes using TypeBox with compile-time type checking
* **Structure validation**: Ajv-based validation of JSON-LD node structure (types, formats, required fields)
* **Shape validation**: ShEx-like local node validation (cardinality, range constraints, @type membership)
* **JSON-LD context generation**: Automatically generate `@context` from shape definitions for Comunica/GraphQL-LD
* **Ingestion hygiene**: Ensure only valid, consistent data enters your triplestore (Neptune, etc.)

### ❌ What ResourceBox Does NOT Do

* **OWL reasoning**: No inference, transitive closure, or TBox/ABox reasoning (use Neptune or OWL reasoner)
* **Data querying**: No SPARQL execution or data fetching (use Comunica + GraphQL-LD)
* **External validation**: No checking if referenced IRIs exist (no I/O, purely local validation)
* **Global consistency**: No cross-graph or federated validation

## Architecture

```
               ┌──────────────┐
               │ resourcebox  │
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
pnpm add @gftdcojp/resourcebox
```

## Quick Start

### 1. Define a Shape

```typescript
import { Type } from "@sinclair/typebox";
import { defineShape, iri, cardinality, range } from "@gftdcojp/resourcebox";

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
import { buildContext } from "@gftdcojp/resourcebox";

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
import { validateStruct, validateShape } from "@gftdcojp/resourcebox";

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

ResourceBox enforces consistency at **compile time** using TypeScript's type system:

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

ResourceBox is designed to integrate with **Comunica + GraphQL-LD** for data querying:

1. **ResourceBox** generates `@context` from shapes
2. **Comunica + GraphQL-LD** uses `@context` to translate GraphQL queries to SPARQL
3. **Nexus** provides GraphQL API (edge layer)

This separation allows:
- **ResourceBox**: Focus on ingestion hygiene and validation
- **Comunica**: Handle query translation and execution
- No need to build custom SPARQL DSL (unless advanced UPDATE operations are needed)

## API Reference

### DSL Functions

- `iri<T>(uri: string): IRI<T>` - Create a branded IRI type
- `cardinality(opts)` - Define cardinality constraints
- `range.datatype(iri)` - Define a literal datatype range
- `range.shape(shapeId)` - Define a shape reference range
- `defineShape<T>(def)` - Define a shape (main API)

### Context Generation

- `buildContext(shapes, options?)` - Generate JSON-LD `@context` from shapes
- `mergeContexts(contexts)` - Merge multiple contexts
- `extractNamespacePrefixes(shapes)` - Extract namespace prefixes

### Validation Functions

- `validateStruct(shape, data)` - Structural validation (Ajv-based)
- `validateShape(shape, data)` - Semantic shape validation (ShEx-like)
- `validateStructBatch(shape, dataArray)` - Validate multiple nodes (structure)
- `validateShapeBatch(shape, dataArray)` - Validate multiple nodes (shape)

### Report Types

- `ValidationResult` - Structural validation report
- `ShapeReport` - Shape validation report
- `ShapeViolation` - Shape constraint violation

## Project Structure

```
resourcebox/
├── src/
│   ├── core/                     # Core shape definition and context
│   │   ├── types/                # Type definitions (IRI, Range, Shape, etc.)
│   │   ├── dsl/                  # DSL API (defineShape, iri, cardinality, etc.)
│   │   ├── typecheck/            # Compile-time consistency checks
│   │   └── context/              # JSON-LD context generation
│   ├── validate/                 # Validation logic
│   │   ├── struct/               # Ajv-based structural validation
│   │   ├── shape/                # ShEx-like shape validation
│   │   └── report/               # Validation report types
│   └── index.ts                  # Main entry point
├── package.json                  # @gftdcojp/resourcebox
├── tsconfig.json
├── vitest.config.ts
├── biome.json
├── story.jsonnet                 # Process network DAG
└── README.md
```

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

Future `@gftdcojp/resourcebox-effect` can handle I/O-based validation separately.

### 4. Separation of Concerns

- **Ingestion** (ResourceBox): Ensure data validity before entering the triplestore
- **Reasoning** (Neptune/OWL reasoner): Infer new facts, transitive closure
- **Querying** (Comunica + GraphQL-LD): Fetch and transform data

## Entropy Minimization

ResourceBox follows **information entropy minimization** principles:

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

**ResourceBox** = TypeBox-inspired + RDF Resource Type Builder + SHACL Validation + OWL Ontology Support + JSON-LD Context Generation

型安全なRDFリソース定義と意味制約の統合ライブラリ。
