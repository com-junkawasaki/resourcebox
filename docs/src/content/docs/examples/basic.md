---
title: Basic Usage
description: Simple examples to get you started with ResourceBox
---

This guide shows basic usage patterns for ResourceBox.

## Simple Person Resource

Define a basic Person resource with name and email:

```typescript
import { Onto, Resource } from '@gftdcojp/resourcebox';

const foaf = Onto.FOAF;

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
  })
});

// Type inference
type Person = Resource.Static<typeof PersonResource>;

// Validate data
const john: Person = {
  "@id": "http://example.org/john",
  "@type": [foaf("Person")],
  name: "John Doe",
  email: "john@example.org"
};

const result = Resource.validate(PersonResource, john);
console.log(result.ok ? "✓ Valid" : "✗ Invalid");
```

## Book Catalog

A simple book catalog with validation:

```typescript
const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});

const Book = Onto.Class({
  iri: ex("Book"),
  label: "Book"
});

const BookResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([ex("Book")]),
  
  title: Resource.String({
    property: ex("title"),
    minLength: 1,
    required: true
  }),
  
  author: Resource.String({
    property: ex("author"),
    minLength: 1,
    required: true
  }),
  
  isbn: Resource.String({
    property: ex("isbn"),
    pattern: "^\\d{13}$",
    required: true
  }),
  
  publishedYear: Resource.Number({
    property: ex("publishedYear"),
    minimum: 1800,
    maximum: 2100,
    optional: true
  })
}, {
  class: Book
});

type Book = Resource.Static<typeof BookResource>;

// Example book
const book: Book = {
  "@id": "http://example.org/books/typescript-handbook",
  "@type": [ex("Book")],
  title: "The TypeScript Handbook",
  author: "Microsoft",
  isbn: "1234567890123",
  publishedYear: 2020
};

// Validate
const result = Resource.validate(BookResource, book);

if (result.ok) {
  console.log("Book is valid!");
  console.log(`Title: ${result.data.title}`);
} else {
  console.error("Validation errors:");
  result.errors?.forEach(err => {
    console.error(`  ${err.path}: ${err.message}`);
  });
}
```

## Generate JSON-LD Context

Automatically generate JSON-LD `@context`:

```typescript
const context = Resource.context(BookResource, {
  includeNamespaces: true,
  namespaces: {
    ex: "http://example.org/"
  }
});

console.log(JSON.stringify(context, null, 2));
```

Output:

```json
{
  "@context": {
    "ex": "http://example.org/",
    "title": { "@id": "ex:title" },
    "author": { "@id": "ex:author" },
    "isbn": { "@id": "ex:isbn" },
    "publishedYear": { "@id": "ex:publishedYear", "@type": "xsd:integer" }
  }
}
```

## Compose Resources

Build complex resources from simple parts:

```typescript
// Define reusable components
const EmailField = Resource.String({
  format: "email",
  property: foaf("mbox")
});

const PhoneField = Resource.String({
  pattern: "^\\+?[0-9\\-\\s]+$",
  property: foaf("phone")
});

// Compose into Contact
const ContactResource = Resource.Object({
  email: Resource.Optional(EmailField),
  phone: Resource.Optional(PhoneField)
});

// Compose into Person
const PersonWithContactResource = Resource.Object({
  name: Resource.String({ property: foaf("name"), required: true }),
  contact: ContactResource
});

type PersonWithContact = Resource.Static<typeof PersonWithContactResource>;
```

## Array of References

Define arrays of references to other resources:

```typescript
const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([foaf("Person")]),
  
  name: Resource.String({
    property: foaf("name"),
    required: true
  }),
  
  friends: Resource.Array(
    Resource.Ref(foaf("Person")),
    {
      property: foaf("knows"),
      uniqueItems: true
    }
  )
});

type Person = Resource.Static<typeof PersonResource>;

const john: Person = {
  "@id": "http://example.org/john",
  "@type": [foaf("Person")],
  name: "John Doe",
  friends: [
    "http://example.org/jane",
    "http://example.org/bob"
  ]
};
```

## Validation Helpers

Use helper functions for validation:

```typescript
// Boolean check
const isValid = Resource.check(PersonResource, data);

if (!isValid) {
  console.error("Data is invalid");
}

// Parse (throws on invalid)
try {
  const person = Resource.parse(PersonResource, data);
  console.log(`Hello, ${person.name}!`);
} catch (error) {
  console.error("Parse error:", error);
}
```

## Next Steps

- [With Ontology](/examples/ontology/) - More complex ontology examples
- [Validation](/examples/validation/) - Advanced validation patterns
- [Inference](/examples/inference/) - Use RDFS/OWL Lite reasoning
- [SPARQL Integration](/examples/sparql/) - Integrate with SPARQL databases

