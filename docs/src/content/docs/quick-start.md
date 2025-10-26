---
title: Quick Start
description: Build your first semantic web application with ResourceBox
---

This guide will walk you through creating a simple Person resource with full type safety and validation.

## Step 1: Define Your Ontology

Start by defining your RDF vocabulary using the Onto layer:

```typescript
import { Onto } from '@gftdcojp/resourcebox';

// Use built-in FOAF namespace
const foaf = Onto.FOAF;

// Or create custom namespace
const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});

// Define classes
const Person = Onto.Class({
  iri: foaf("Person"),
  label: "Person",
  comment: "A human being"
});

// Define properties
const age = Onto.Property({
  iri: ex("age"),
  label: "age",
  domain: [Person],
  range: [Onto.Datatype.Integer],
  functional: true
});
```

## Step 2: Define Resource Schema

Create a type-safe data structure using the Resource layer:

```typescript
import { Resource } from '@gftdcojp/resourcebox';

const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([foaf("Person")]),
  
  name: Resource.String({
    property: foaf("name"),
    minLength: 1,
    required: true
  }),
  
  email: Resource.String({
    property: foaf("mbox"),
    format: "email",
    optional: true
  }),
  
  age: Resource.Number({
    property: age,
    minimum: 0,
    maximum: 150,
    optional: true
  }),
  
  friends: Resource.Array(
    Resource.Ref(Person),
    { property: foaf("knows") }
  )
}, {
  class: Person
});
```

## Step 3: Type Inference

Get full TypeScript type safety:

```typescript
type Person = Resource.Static<typeof PersonResource>;

// TypeScript knows the exact type:
// {
//   "@id": string;
//   "@type": OntoIRI[];
//   name: string;
//   email?: string;
//   age?: number;
//   friends: string[];
// }
```

## Step 4: Validate Data

Validate your data with structural validation:

```typescript
const validData = {
  "@id": "http://example.org/john",
  "@type": [foaf("Person")],
  name: "John Doe",
  email: "john@example.org",
  age: 30,
  friends: ["http://example.org/jane"]
};

const result = Resource.validate(PersonResource, validData);

if (result.ok) {
  console.log("✓ Valid:", result.data);
  // TypeScript knows result.data is of type Person
} else {
  console.error("✗ Errors:", result.errors);
}
```

## Step 5: Define SHACL Shape (Optional)

For semantic validation, define a SHACL shape:

```typescript
import { Shape } from '@gftdcojp/resourcebox';

const PersonShape = Shape.Define({
  targetClass: Person,
  
  property: {
    name: Shape.Property({
      path: foaf("name"),
      datatype: Onto.Datatype.String,
      minCount: 1,
      maxCount: 1
    }),
    
    email: Shape.Property({
      path: foaf("mbox"),
      datatype: Onto.Datatype.String,
      maxCount: 1,
      pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
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

// Validate against SHACL shape
const shapeResult = Shape.validate(PersonShape, validData);

if (!shapeResult.ok) {
  console.error("SHACL violations:", shapeResult.violations);
}
```

## Step 6: Generate JSON-LD Context

Automatically generate JSON-LD `@context`:

```typescript
const context = Resource.context(PersonResource, {
  includeNamespaces: true,
  namespaces: {
    foaf: "http://xmlns.com/foaf/0.1/",
    ex: "http://example.org/"
  }
});

console.log(JSON.stringify(context, null, 2));

// Result:
// {
//   "@context": {
//     "foaf": "http://xmlns.com/foaf/0.1/",
//     "ex": "http://example.org/",
//     "name": { "@id": "foaf:name" },
//     "email": { "@id": "foaf:mbox" },
//     "age": { "@id": "ex:age", "@type": "xsd:integer" },
//     "friends": { "@id": "foaf:knows", "@type": "@id" }
//   }
// }
```

## Step 7: Use with Inference (Optional)

For RDFS/OWL Lite reasoning:

```typescript
const inferenceContext = Onto.createInferenceContext(
  [
    { iri: Person.iri },
    { iri: foaf("Agent") }
  ],
  [
    { iri: foaf("knows"), domain: [Person.iri] }
  ]
);

// Use inference context in Shape validation
const resultWithInference = Shape.validate(
  PersonShape,
  validData,
  inferenceContext
);
```

## Complete Example

Here's the complete working example:

```typescript
import { Onto, Resource, Shape } from '@gftdcojp/resourcebox';

// 1. Define ontology
const foaf = Onto.FOAF;
const Person = Onto.Class({ iri: foaf("Person") });

// 2. Define resource
const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([foaf("Person")]),
  name: Resource.String({ property: foaf("name"), required: true }),
  email: Resource.String({ property: foaf("mbox"), format: "email", optional: true })
}, { class: Person });

// 3. Type inference
type Person = Resource.Static<typeof PersonResource>;

// 4. Validate
const data: Person = {
  "@id": "http://example.org/john",
  "@type": [foaf("Person")],
  name: "John Doe",
  email: "john@example.org"
};

const result = Resource.validate(PersonResource, data);
console.log(result.ok ? "✓ Valid" : "✗ Invalid");

// 5. Generate context
const context = Resource.context(PersonResource);
console.log(context);
```

## Next Steps

- Learn about the [Onto Layer](/onto/overview/)
- Explore [Resource Layer](/resource/overview/) capabilities
- Understand [Shape Layer](/shape/overview/) validation
- Check out more [Examples](/examples/basic/)

