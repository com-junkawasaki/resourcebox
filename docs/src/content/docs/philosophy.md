---
title: Design Philosophy
description: Understanding ResourceBox's design principles and philosophy
---

ResourceBox adapts the TypeBox design philosophy to the semantic web, providing a unified approach to building type-safe RDF resources.

## Core Philosophy

<div class="philosophy-highlight">

**"TS静的型×RDF/OWL/SHACL、関数合成、標準準拠のランタイム検証"**

*Unify TypeScript static types with RDF, OWL, and SHACL; compose schemas functionally; validate at runtime against open standards.*

Inspired by [TypeBox](https://github.com/sinclairzx81/typebox).

</div>

## Three Pillars

### 1. Unify TypeScript Static Types with RDF/OWL/SHACL

ResourceBox provides a seamless integration between TypeScript's type system and the semantic web standards:

```typescript
// TypeScript types match RDF semantics
const PersonResource = Resource.Object({
  name: Resource.String({ property: foaf("name"), required: true })
});

type Person = Resource.Static<typeof PersonResource>;
// → { name: string }

// Compile-time type checking matches runtime validation
const person: Person = { name: "John" }; // ✓ TypeScript happy
const result = Resource.validate(PersonResource, person); // ✓ Runtime happy
```

**Benefits:**
- Type safety at compile time
- Runtime validation against the same schema
- No divergence between types and validation rules

### 2. Compose Schemas Functionally

Build complex schemas from simple, reusable parts using function composition:

```typescript
// Primitive builders
const Name = Resource.String({ minLength: 1 });
const Email = Resource.String({ format: "email" });
const Age = Resource.Number({ minimum: 0 });

// Compose into complex schemas
const Person = Resource.Object({
  name: Name,
  email: Resource.Optional(Email),
  age: Resource.Optional(Age)
});

// Reuse in other schemas
const Employee = Resource.Object({
  ...Person.properties,
  employeeId: Resource.String({ pattern: "^EMP-\\d+$" })
});
```

**Benefits:**
- Code reuse and modularity
- Consistent patterns across your codebase
- Easy to maintain and refactor

### 3. Validate at Runtime Against Open Standards

Use standard validation technologies without vendor lock-in:

```typescript
// JSON Schema validation (via Ajv)
const structResult = Resource.validate(PersonResource, data);

// SHACL validation (W3C standard)
const shapeResult = Shape.validate(PersonShape, data);

// RDFS/OWL Lite reasoning
const context = Onto.createInferenceContext(classes, properties);
const resultWithInference = Shape.validate(PersonShape, data, context);
```

**Standards used:**
- **JSON Schema** - Structural validation
- **SHACL (W3C)** - Semantic constraints
- **RDF 1.2 (W3C)** - Data model
- **OWL 2 (W3C)** - Ontology language
- **JSON-LD 1.1 (W3C)** - Linked data format

## Separation of Concerns

ResourceBox follows a clear three-layer architecture, each with distinct responsibilities:

### Onto Layer: Vocabulary

Define **what things are** and **how they relate**:

```typescript
const Person = Onto.Class({
  iri: ex("Person"),
  label: "Person",
  subClassOf: [foaf("Agent")]
});

const hasEmail = Onto.Property({
  iri: ex("hasEmail"),
  domain: [Person],
  range: [Onto.Datatype.String]
});
```

**Responsibility:** Define RDF vocabulary (classes, properties, relationships)

### Resource Layer: Structure

Define **data structure** and **TypeScript types**:

```typescript
const PersonResource = Resource.Object({
  name: Resource.String({ required: true }),
  email: Resource.String({ format: "email", optional: true })
});

type Person = Resource.Static<typeof PersonResource>;
```

**Responsibility:** Define data shapes with type inference and structural validation

### Shape Layer: Constraints

Define **semantic constraints** and **validation rules**:

```typescript
const PersonShape = Shape.Define({
  targetClass: Person,
  property: {
    name: Shape.Property({
      minCount: 1,
      maxCount: 1,
      datatype: Onto.Datatype.String
    })
  }
});
```

**Responsibility:** Define SHACL constraints and semantic validation

## Inspired by TypeBox

ResourceBox adopts TypeBox's elegant API design patterns:

| TypeBox Pattern | ResourceBox Adaptation |
|----------------|------------------------|
| `Type.String()` | `Resource.String()` for structure, `Onto.Datatype.String` for semantics |
| `Type.Object()` | `Resource.Object()` for data, `Onto.Class()` for vocabulary |
| `Type.Optional()` | `Resource.Optional()` with semantic cardinality support |
| `Type.Static<T>` | `Resource.Static<T>` for type inference |
| Fluent API | Consistent across all three layers |
| Composability | Enhanced with RDF/OWL composition |

**Key differences:**
- ResourceBox adds semantic layer (Onto + Shape)
- Support for RDF vocabularies and ontologies
- SHACL constraint validation
- JSON-LD context generation
- RDFS/OWL Lite reasoning

## Information Entropy Minimization

ResourceBox aims to minimize information entropy throughout the development process:

### Avoid Duplication

Define once, use everywhere:

```typescript
// Define ontology once
const Person = Onto.Class({ iri: ex("Person") });

// Use in Resource layer
const PersonResource = Resource.Object({...}, { class: Person });

// Use in Shape layer
const PersonShape = Shape.Define({ targetClass: Person, ... });

// Generate from Resource
const autoShape = Shape.fromResource(PersonResource);
```

### Reduce Ambiguity

Clear, unambiguous APIs:

```typescript
// ✓ Clear intent
Resource.String({ required: true })
Resource.String({ optional: true })

// ✓ Explicit semantic relationship
Resource.String({ property: foaf("name") })

// ✓ Standard-based validation
Shape.Property({ datatype: Onto.Datatype.String })
```

### Maintain Consistency

Type safety ensures consistency:

```typescript
// TypeScript enforces consistency
const schema = Resource.Object({
  age: Resource.Number({ minimum: 0 })
});

// This won't compile:
const data: Resource.Static<typeof schema> = { age: -1 }; // ✗

// Runtime validation matches:
Resource.validate(schema, { age: -1 }); // ✗ Invalid
```

## Design Principles

1. **TypeScript-First** - Leverage TypeScript's type system for compile-time safety
2. **Standards-Based** - Build on W3C standards (RDF, OWL, SHACL, JSON-LD)
3. **Progressive Enhancement** - Use as much or as little as you need
4. **Composable** - Build complex schemas from simple parts
5. **Explicit** - Clear, unambiguous APIs
6. **Performant** - Lightweight reasoning, fast validation
7. **Production-Ready** - Comprehensive testing, linting, documentation

## Next Steps

- See how these principles apply in the [Quick Start Guide](/quick-start/)
- Explore the [Onto Layer](/onto/overview/) for vocabulary definition
- Learn about the [Resource Layer](/resource/overview/) for data structures
- Understand the [Shape Layer](/shape/overview/) for constraints

