---
title: Resource Layer Overview
description: Define type-safe data structures with TypeBox-like API
---

The Resource layer provides a TypeBox-inspired API for defining data structures with full TypeScript type inference. This is where you define **data structure** and **TypeScript types**.

## Purpose

The Resource layer handles:

- Defining data structure schemas (TypeBox-like)
- TypeScript type inference with `Resource.Static<T>`
- Structural validation (JSON Schema via Ajv)
- JSON-LD context generation
- Mapping properties to RDF vocabulary

## Core Concepts

### Primitives

Define primitive types with validation rules:

```typescript
import { Resource } from '@gftdcojp/resourcebox';

const Name = Resource.String({
  minLength: 1,
  maxLength: 100
});

const Age = Resource.Number({
  minimum: 0,
  maximum: 150
});

const IsActive = Resource.Boolean();
```

### Objects

Define object schemas:

```typescript
const PersonResource = Resource.Object({
  name: Resource.String({ required: true }),
  age: Resource.Number({ optional: true }),
  email: Resource.String({ format: "email", optional: true })
});
```

### Type Inference

Get TypeScript types from schemas:

```typescript
type Person = Resource.Static<typeof PersonResource>;
// → { name: string; age?: number; email?: string }
```

### Validation

Validate data against schemas:

```typescript
const result = Resource.validate(PersonResource, data);

if (result.ok) {
  console.log("Valid:", result.data);
  // result.data is typed as Person
} else {
  console.error("Errors:", result.errors);
}
```

### Context Generation

Generate JSON-LD `@context` automatically:

```typescript
const context = Resource.context(PersonResource, {
  includeNamespaces: true,
  namespaces: {
    foaf: "http://xmlns.com/foaf/0.1/"
  }
});
```

## API Reference

### Primitives

```typescript
Resource.String(options?: {
  minLength?: number,
  maxLength?: number,
  pattern?: string,
  format?: string,  // "email", "uri", "date-time", etc.
  property?: OntoIRI,
  required?: boolean,
  optional?: boolean
})

Resource.Number(options?: {
  minimum?: number,
  maximum?: number,
  property?: OntoIRI,
  required?: boolean,
  optional?: boolean
})

Resource.Boolean(options?: {
  property?: OntoIRI,
  required?: boolean,
  optional?: boolean
})
```

### Complex Types

```typescript
Resource.Object(
  properties: Record<string, AnyResourceSchema>,
  options?: { class?: OntoClass }
)

Resource.Array(
  items: AnyResourceSchema,
  options?: {
    minItems?: number,
    maxItems?: number,
    uniqueItems?: boolean,
    property?: OntoIRI
  }
)

Resource.Ref(target: OntoClass | OntoIRI)

Resource.Optional(schema: AnyResourceSchema)

Resource.Literal(value: any)
```

### Validation

```typescript
Resource.validate<S>(schema: S, data: unknown): ValidationResult

Resource.check<S>(schema: S, data: unknown): boolean

Resource.parse<S>(schema: S, data: unknown): Resource.Static<S>
```

### Context

```typescript
Resource.context(schema: AnyResourceSchema, options?: {
  includeNamespaces?: boolean,
  namespaces?: Record<string, string>
}): JsonLdContext
```

### Shaped (Unified API)

```typescript
Resource.Shaped(options: {
  class?: OntoIRI,
  properties: Record<string, AnyResourceSchema>,
  shape?: {
    closed?: boolean,
    ...
  }
}): ShapedResource
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

### With RDF Properties

```typescript
const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([foaf("Person")]),
  
  name: Resource.String({
    property: foaf("name"),
    required: true
  }),
  
  friends: Resource.Array(
    Resource.Ref(Person),
    { property: foaf("knows") }
  )
}, {
  class: Person
});
```

### Validation Example

```typescript
const data = {
  name: "John Doe",
  age: 30
};

const result = Resource.validate(PersonResource, data);

if (result.ok) {
  // TypeScript knows result.data is Person
  console.log(result.data.name);
} else {
  result.errors?.forEach(err => {
    console.error(`${err.path}: ${err.message}`);
  });
}
```

## Next Steps

- [Primitives](/resource/primitives/) - String, Number, Boolean
- [Object](/resource/object/) - Define object schemas
- [Array](/resource/array/) - Define array schemas
- [Validation](/resource/validation/) - Validate data
- [Context](/resource/context/) - Generate JSON-LD contexts
- [Shaped](/resource/shaped/) - Unified API for all three layers

