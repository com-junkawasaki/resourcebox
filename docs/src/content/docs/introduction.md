---
title: Introduction
description: Learn about ResourceBox and its core concepts
---

ResourceBox is a TypeScript-first library for building RDF resources with type safety and validation. It brings the elegant API design of TypeBox to the semantic web, providing a unified approach to defining vocabularies, data structures, and constraints.

## What is ResourceBox?

ResourceBox provides a clean, type-safe API for:

- **Defining RDF vocabularies** (OWL/RDFS classes and properties)
- **Building data structures** with TypeScript type inference
- **Validating data** against both structural and semantic constraints
- **Generating JSON-LD contexts** automatically
- **Performing lightweight reasoning** with RDFS/OWL Lite

## Three-Layer Architecture

ResourceBox follows a clear separation of concerns with three distinct layers:

### 1. Onto Layer (OWL/RDFS Ontology)

Define vocabulary, classes, properties, and relationships.

```typescript
const foaf = Onto.Namespace({
  prefix: "foaf",
  uri: "http://xmlns.com/foaf/0.1/"
});

const Person = Onto.Class({
  iri: foaf("Person"),
  label: "Person",
  comment: "A human being"
});
```

### 2. Resource Layer (Data Structure)

Define data structures with TypeBox-like API and full type inference.

```typescript
const PersonResource = Resource.Object({
  name: Resource.String({
    property: foaf("name"),
    required: true
  }),
  email: Resource.String({
    property: foaf("mbox"),
    format: "email",
    optional: true
  })
});

type Person = Resource.Static<typeof PersonResource>;
```

### 3. Shape Layer (SHACL Constraints)

Define SHACL shapes for semantic validation.

```typescript
const PersonShape = Shape.Define({
  targetClass: Person,
  property: {
    name: Shape.Property({
      path: foaf("name"),
      datatype: Onto.Datatype.String,
      minCount: 1
    })
  }
});
```

## Design Philosophy

ResourceBox adapts the TypeBox design philosophy to the semantic web:

**"TS静的型×RDF/OWL/SHACL、関数合成、標準準拠のランタイム検証"**

- **Unify TypeScript static types with RDF, OWL, and SHACL** - Compile-time type checking matches runtime validation
- **Compose schemas functionally** - Build complex schemas from simple, reusable parts
- **Validate at runtime against open standards** - Use standard JSON Schema, SHACL, and RDFS/OWL Lite

Inspired by [TypeBox](https://github.com/sinclairzx81/typebox).

## Key Features

- 🎯 **TypeBox-like API** - Fluent, intuitive schema definition
- 🔒 **Type Safety** - Full TypeScript type inference with `Resource.Static<T>`
- ✅ **Triple Validation** - Structural (JSON Schema) + Semantic (SHACL) + Inference (RDFS/OWL Lite)
- 🧠 **Lightweight Reasoning** - RDFS closure + OWL Lite support without heavy computation
- 🌐 **JSON-LD** - Automatic `@context` generation
- 🔗 **Composable** - Build complex ontologies from simple pieces
- 🚀 **Production Ready** - Neptune VPC proxy, comprehensive testing, linting

## When to Use ResourceBox

ResourceBox is ideal for:

- Building semantic web applications with TypeScript
- Creating type-safe RDF data models
- Validating JSON-LD data against SHACL constraints
- Generating RDF vocabularies from TypeScript definitions
- Integrating with SPARQL databases (Neptune, Stardog, GraphDB, etc.)

## Comparison with Other Libraries

| Feature | ResourceBox | TypeBox | ShEx | SHACL-JS |
|---------|------------|---------|------|----------|
| TypeScript Support | ✅ Full | ✅ Full | ❌ | ❌ |
| Type Inference | ✅ | ✅ | ❌ | ❌ |
| RDF/OWL Support | ✅ RDFS/OWL Lite | ❌ | ✅ | ✅ |
| Lightweight Reasoning | ✅ RDFS/OWL Lite | ❌ | ❌ | ❌ |
| JSON Schema Validation | ✅ | ✅ | ❌ | ❌ |
| SHACL Validation | ✅ Core | ❌ | Partial | ✅ |
| JSON-LD Context Gen | ✅ | ❌ | ❌ | ❌ |
| Fluent API | ✅ | ✅ | ❌ | ❌ |

## Next Steps

- [Install ResourceBox](/installation/) in your project
- Follow the [Quick Start Guide](/quick-start/) to build your first application
- Explore the [API Reference](/onto/overview/) for detailed documentation

