# ResourceBox

**TypeBox-inspired RDF Resource type builder with SHACL validation and OWL ontology support for TypeScript**

ResourceBox provides a clean, TypeScript-first API for defining RDF resources, OWL ontologies, and SHACL constraints. Inspired by TypeBox's elegant design, ResourceBox brings type safety and validation to the semantic web.

## Features

- 🎯 **TypeBox-like API**: Fluent, intuitive schema definition
- 🔒 **Type Safety**: Full TypeScript type inference with `Resource.Static<T>`
- ✅ **Dual Validation**: Structural (JSON Schema) + Semantic (SHACL) validation
- 🌐 **JSON-LD**: Automatic `@context` generation
- 📦 **Three Layers**: Onto (OWL/RDFS) → Resource (Data) → Shape (SHACL)
- 🔗 **Composable**: Build complex ontologies from simple pieces

## Installation

```bash
pnpm add @gftdcojp/resourcebox
```

## Quick Start

### Basic Example

```typescript
import { Onto, Resource, Shape } from '@gftdcojp/resourcebox';

// 1. Define ontology (optional but recommended)
const foaf = Onto.Namespace({
  prefix: "foaf",
  uri: "http://xmlns.com/foaf/0.1/"
});

const Person = Onto.Class({
  iri: foaf("Person"),
  label: "Person"
});

const name = Onto.Property({
  iri: foaf("name"),
  domain: [Person],
  range: [Onto.Datatype.String],
  functional: true
});

// 2. Define resource schema (TypeBox-inspired)
const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([foaf("Person")]),
  
  name: Resource.String({
    property: name,
    minLength: 1,
    required: true
  }),
  
  email: Resource.String({
    property: foaf("mbox"),
    format: "email",
    optional: true
  }),
  
  friends: Resource.Array(
    Resource.Ref(Person),
    { property: foaf("knows") }
  )
}, {
  class: Person
});

// 3. Type inference (like TypeBox)
type Person = Resource.Static<typeof PersonResource>;
// → { "@id": string; "@type": OntoIRI[]; name: string; email?: string; friends: string[] }

// 4. Validate data
const validData = {
  "@id": "http://example.org/john",
  "@type": [foaf("Person")],
  name: "John Doe",
  email: "john@example.org",
  friends: ["http://example.org/jane"]
};

const result = Resource.validate(PersonResource, validData);
if (result.ok) {
  console.log("✓ Valid:", result.data);
} else {
  console.error("✗ Errors:", result.errors);
}

// 5. Generate JSON-LD context
const context = Resource.context(PersonResource, {
  includeNamespaces: true,
  namespaces: {
    foaf: "http://xmlns.com/foaf/0.1/"
  }
});
```

## API Overview

ResourceBox has three main layers:

### 1. Onto Layer (OWL/RDFS Ontology)

Define vocabulary, classes, properties, and relationships.

```typescript
// Namespace
const ex = Onto.Namespace({ prefix: "ex", uri: "http://example.org/" });
const foaf = Onto.FOAF;  // Built-in: FOAF, RDF, RDFS, OWL, XSD

// Class
const Person = Onto.Class({
  iri: ex("Person"),
  label: "Person",
  comment: "A human being",
  subClassOf: [foaf("Agent")]
});

// Property
const age = Onto.Property({
  iri: ex("age"),
  label: "age",
  domain: [Person],
  range: [Onto.Datatype.Integer],
  functional: true
});

// Built-in XSD Datatypes
Onto.Datatype.String
Onto.Datatype.Integer
Onto.Datatype.Boolean
Onto.Datatype.Date
Onto.Datatype.DateTime
// ... and more
```

### 2. Resource Layer (Data Structure)

Define data structures with TypeBox-like API.

```typescript
// Primitives
Resource.String({ minLength: 1, maxLength: 100, pattern: "^[A-Z]" })
Resource.Number({ minimum: 0, maximum: 150 })
Resource.Boolean()

// Complex types
Resource.Object({
  name: Resource.String(),
  age: Resource.Number({ optional: true })
})

Resource.Array(Resource.String(), { minItems: 1, uniqueItems: true })

// References
Resource.Ref(Person)  // IRI reference to another resource

// Literals
Resource.Literal(["foaf:Person"])  // Constant value

// Optional
Resource.Optional(Resource.String())
// or
Resource.String({ optional: true })

// With RDF property mapping
Resource.String({
  property: foaf("name"),  // Link to ontology
  required: true,
  minLength: 1
})

// Type inference
type PersonType = Resource.Static<typeof PersonResource>;
```

### 3. Shape Layer (SHACL Constraints)

Define SHACL shapes for semantic validation.

```typescript
// Manual shape definition
const PersonShape = Shape.Define({
  targetClass: Person,
  
  property: {
    name: Shape.Property({
      path: foaf("name"),
      datatype: Onto.Datatype.String,
      minCount: 1,
      maxCount: 1,
      pattern: "^[A-Z]"
    }),
    
    age: Shape.Property({
      path: ex("age"),
      datatype: Onto.Datatype.Integer,
      minInclusive: 0,
      maxInclusive: 150
    })
  },
  
  closed: true
});

// Auto-generate from Resource
const AutoShape = Shape.fromResource(PersonResource, {
  strict: true
});

// Validate against shape
const result = Shape.validate(PersonShape, data);
if (!result.ok) {
  console.error(result.violations);
}
```

## Validation

ResourceBox provides two levels of validation:

### 1. Structural Validation (JSON Schema)

Validates data structure, types, and formats using Ajv.

```typescript
const result = Resource.validate(PersonResource, data);
// Checks: required fields, types, string lengths, patterns, etc.
```

### 2. Semantic Validation (SHACL)

Validates RDF constraints like cardinality, ranges, and class membership.

```typescript
const result = Shape.validate(PersonShape, data);
// Checks: minCount, maxCount, datatypes, classes, patterns, etc.
```

## JSON-LD Context Generation

```typescript
const context = Resource.context(PersonResource, {
  includeNamespaces: true,
  namespaces: {
    foaf: "http://xmlns.com/foaf/0.1/",
    ex: "http://example.org/"
  }
});

// Result:
// {
//   "@context": {
//     "foaf": "http://xmlns.com/foaf/0.1/",
//     "ex": "http://example.org/",
//     "name": { "@id": "foaf:name" },
//     "email": { "@id": "foaf:mbox" },
//     "friends": { "@id": "foaf:knows", "@type": "@id" }
//   }
// }
```

## Integrated API

For complex scenarios, use `Resource.Shaped()` to combine all three layers:

```typescript
const Person = Resource.Shaped({
  class: foaf("Person"),
  
  properties: {
    name: Resource.String({
      property: foaf("name"),
      required: true,
      minLength: 1
    }),
    
    email: Resource.String({
      property: foaf("mbox"),
      format: "email",
      optional: true
    })
  },
  
  shape: {
    closed: true
  }
});
```

## Examples

### Simple Resource

```typescript
const Book = Resource.Object({
  title: Resource.String({ minLength: 1 }),
  author: Resource.String(),
  isbn: Resource.String({ pattern: "^\\d{13}$" }),
  publishedYear: Resource.Number({ minimum: 1800, maximum: 2100 })
});

type Book = Resource.Static<typeof Book>;
```

### With Ontology

```typescript
const bibo = Onto.Namespace({
  prefix: "bibo",
  uri: "http://purl.org/ontology/bibo/"
});

const Book = Onto.Class({ iri: bibo("Book") });
const title = Onto.Property({
  iri: bibo("title"),
  range: [Onto.Datatype.String]
});

const BookResource = Resource.Object({
  title: Resource.String({
    property: title,
    required: true
  })
}, {
  class: Book
});
```

### With Shape Validation

```typescript
const BookShape = Shape.fromResource(BookResource, { strict: true });

const data = {
  title: "The TypeScript Handbook",
  author: "Microsoft",
  isbn: "1234567890123",
  publishedYear: 2020
};

const structResult = Resource.validate(BookResource, data);
const shapeResult = Shape.validate(BookShape, data);

if (structResult.ok && shapeResult.ok) {
  console.log("✓ Data is valid!");
}
```

## Design Principles

1. **TypeScript-first**: Leverage TypeScript's type system for compile-time safety
2. **Layered Architecture**: Separate concerns (Onto → Resource → Shape)
3. **Progressive Enhancement**: Use as much or as little as you need
4. **TypeBox Compatibility**: Familiar API for TypeBox users
5. **Semantic Web Standards**: Built on RDF, OWL, SHACL, JSON-LD

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ResourceBox                      │
├─────────────┬─────────────────┬────────────────────┤
│  Onto       │  Resource       │  Shape             │
│  (OWL/RDFS) │  (Data)         │  (SHACL)           │
├─────────────┼─────────────────┼────────────────────┤
│ - Namespace │ - String        │ - Define           │
│ - Class     │ - Number        │ - Property         │
│ - Property  │ - Boolean       │ - fromResource     │
│ - Datatype  │ - Object        │ - validate         │
│             │ - Array         │                    │
│             │ - Ref           │                    │
│             │ - Literal       │                    │
│             │ - Optional      │                    │
│             │ - Static<T>     │                    │
│             │ - validate      │                    │
│             │ - context       │                    │
└─────────────┴─────────────────┴────────────────────┘
```

## Comparison with Other Libraries

| Feature | ResourceBox | TypeBox | ShEx | SHACL-JS |
|---------|------------|---------|------|----------|
| TypeScript Support | ✅ Full | ✅ Full | ❌ | ❌ |
| Type Inference | ✅ | ✅ | ❌ | ❌ |
| RDF/OWL Support | ✅ | ❌ | ✅ | ✅ |
| JSON Schema Validation | ✅ | ✅ | ❌ | ❌ |
| SHACL Validation | ✅ | ❌ | Partial | ✅ |
| JSON-LD Context Gen | ✅ | ❌ | ❌ | ❌ |
| Fluent API | ✅ | ✅ | ❌ | ❌ |

## License

Apache-2.0

## References

- [TypeBox](https://github.com/sinclairzx81/typebox) - Inspiration for API design
- [RDF 1.2](https://www.w3.org/TR/rdf12-concepts/) - RDF specification
- [OWL 2](https://www.w3.org/TR/owl2-overview/) - Web Ontology Language
- [SHACL](https://www.w3.org/TR/shacl/) - Shapes Constraint Language
- [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/) - JSON for Linked Data

---

**ResourceBox** = TypeBox-inspired + RDF Resource Type Builder + SHACL Validation + OWL Ontology Support + JSON-LD Context Generation
