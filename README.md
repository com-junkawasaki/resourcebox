# ResourceBox

**TypeBox-inspired RDF Resource type builder with SHACL Core validation, RDFS/OWL Lite reasoning, and Neptune SigV4 client for TypeScript**

ResourceBox provides a clean, TypeScript-first API for defining RDF resources, OWL ontologies, and SHACL constraints. Inspired by TypeBox's elegant design, ResourceBox brings type safety and validation to the semantic web.

## Features

- 🎯 **TypeBox-like API**: Fluent, intuitive schema definition
- 🔒 **Type Safety**: Full TypeScript type inference with `Resource.Static<T>`
- ✅ **Triple Validation**: Structural (JSON Schema) + Semantic (SHACL) + Inference (RDFS/OWL Lite)
- 🧠 **Lightweight Reasoning**: RDFS closure + OWL Lite (equivalentClass, inverseOf) support
- 🌐 **JSON-LD**: Automatic `@context` generation
- 📦 **Four Layers**: Onto (OWL/RDFS) → Inference (RDFS/OWL Lite) → Resource (Data) → Shape (SHACL Core)
- 🔗 **Composable**: Build complex ontologies from simple pieces
- 🚀 **Production Ready**: Neptune VPC proxy, comprehensive testing, linting

## Design Philosophy

- TS静的型とRDF/OWL/SHACLの合一、関数合成、標準準拠のランタイム検証
  - Unify TypeScript static types with RDF, OWL, and SHACL; compose schemas functionally; validate at runtime against open standards.
  - Inspired by the TypeBox approach of “Json Schema Type Builder with Static Type Resolution,” adapted to the semantic web stack. See [TypeBox](https://github.com/sinclairzx81/typebox).

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
// OWL class expressions (no reasoning, JSON-LD export only)
const ActivityOrCapability = Onto.Expressions.Union([
  ex("Activity"),
  ex("Capability"),
]);

const Artifact = Onto.Class({
  iri: ex("Artifact"),
  equivalentClass: [ActivityOrCapability],
});

// Ontology container + JSON-LD export
const ont = Onto.OntologyContainer({
  iri: ex("dodaf"),
  imports: [Onto.OWL("Thing")],
  classes: [Person, Artifact],
  properties: [age],
});

const owlJsonLd = Onto.toJsonLd(ont);
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

// SHACL-lite extensions and JSON-LD export
const ExtendedShape = Shape.Define({
  targetClass: Person,
  property: {
    email: Shape.Property({
      path: foaf("mbox"),
      nodeKind: "Literal",
      in: ["john@example.org", "jane@example.org"],
      pattern: "@",
      minCount: 1,
      maxCount: 1,
    }),
    knows: Shape.Property({
      path: foaf("knows"),
      nodeKind: "IRI",
      hasValue: "http://example.org/alice",
    }),
  },
  closed: true,
});

const shaclJsonLd = Shape.toJsonLd(ExtendedShape);
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

### With RDFS/OWL Lite Inference

```typescript
import { Onto, createInferenceContext } from '@gftdcojp/resourcebox';

// Define ontology with equivalent classes and inverse properties
const Person = Onto.Class({
  iri: FOAF("Person"),
  equivalentClasses: [EX("Individual")] // OWL Lite
});

const Organization = Onto.Class({ iri: EX("Organization") });

const worksFor = Onto.Property({
  iri: EX("worksFor"),
  domain: [Person],
  range: [Organization],
  inverseOf: EX("employs") // OWL Lite
});

// Create inference context
const context = createInferenceContext(
  [
    { iri: Person.iri, equivalentClasses: [EX("Individual")] },
    { iri: Organization.iri }
  ],
  [
    {
      iri: worksFor.iri,
      inverseOf: EX("employs")
    }
  ]
);

// Validate with inference
const shape = Shape.Define({
  targetClass: Person,
  property: {
    employer: Property({
      path: EX("worksFor"),
      class: Organization // Will use inference to check class compatibility
    })
  }
});

const result = Shape.validate(shape, data, context); // Pass context for inference
```

### Neptune VPC Proxy (SigV4 Authentication)

Complete Node.js client for Neptune with automatic SigV4 signing:

```bash
# Install dependencies
cd examples/neptune-vpc-proxy
pnpm install

# Configure environment
export NEPTUNE_ENDPOINT=https://your-cluster.cluster-xyz.region.neptune.amazonaws.com:8182
export NEPTUNE_DATABASE=your-database

# Query
node query.js

# Update
node update.js
```

### Comunica + SPARQL (Neptune/Stardog/GraphDB/Jena/SAP HANA/Oracle)

See `examples/comunica-sparql`:
- SELECT/CONSTRUCT queries via Comunica
- SPARQL UPDATE via HTTP
- Optional Basic Auth via env
- Local Jena Fuseki with Docker Compose

Quick start:
```bash
cd examples/comunica-sparql
pnpm i
cp .env.example .env
pnpm fuseki   # start local Jena Fuseki on 3030
pnpm update   # write sample triples
pnpm select   # query triples
pnpm construct
```

### Additional Example Suites

- `examples/stardog-basic-auth` — Comunica with Stardog (Basic Auth) complete with SELECT / CONSTRUCT / UPDATE scripts
- `examples/graphdb-public` — Comunica against public Ontotext GraphDB datasets (read-only)
- `examples/neptune-vpc-proxy` — Complete Neptune VPC client with SigV4 signing, SPARQL SELECT/UPDATE support
- `examples/cli-demo` — End-to-end CLI: define ResourceBox model → generate JSON-LD context / SHACL → query via Comunica

## Design Principles

1. **TypeScript-first**: Leverage TypeScript's type system for compile-time safety
2. **Four-Layer Architecture**: Separate concerns (Onto → Inference → Resource → Shape)
3. **Lightweight Reasoning**: RDFS/OWL Lite support without heavy computation
4. **Progressive Enhancement**: Use as much or as little as you need
5. **TypeBox Compatibility**: Familiar API for TypeBox users
6. **Production Ready**: Neptune integration, comprehensive testing, linting
7. **Semantic Web Standards**: Built on RDF, OWL, SHACL, JSON-LD

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ResourceBox                                   │
├─────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│  Onto       │  Inference      │  Resource       │  Shape                  │
│  (OWL/RDFS) │  (RDFS/OWL Lite)│  (Data)         │  (SHACL Core)           │
├─────────────┼─────────────────┼─────────────────┼─────────────────────────┤
│ - Namespace │ - createContext │ - String        │ - Define                │
│ - Class     │ - subClassOf    │ - Number        │ - Property              │
│ - Property  │ - equivalentClass│ - Boolean       │ - fromResource          │
│ - Datatype  │ - inverseOf     │ - Object        │ - validate (w/ inference)│
│             │                 │ - Array         │                         │
│             │                 │ - Ref           │                         │
│             │                 │ - Literal       │                         │
│             │                 │ - Optional      │                         │
│             │                 │ - Static<T>     │                         │
│             │                 │ - validate      │                         │
│             │                 │ - context       │                         │
└─────────────┴─────────────────┴─────────────────┴─────────────────────────┘
```

### RPC Integration (JSON-LD → TypeBox → tRPC/oRPC)

1. **Context生成**: `const context = buildContext([Shape.fromResource(PersonResource)]);`
2. **型抽出**: `const rpcMap = Process.Rpc.expandContextMap(context["@context"]);`
3. **入出力定義**:
   - Literal (`kind: "literal"`) → TypeBox primitive → `procedure.input`
   - Reference (`kind: "reference"`) → IRI 型 → `procedure.output`
4. **RPC登録**:
   ```typescript
   const router = t.router({
     email: t.procedure.input(EmailType).output(ResultType).
       meta({ iri: rpcMap.email.iri })
       .query(handler),
   });
   ```
5. **oRPC** では `rpcMap` 情報を IRI ベースのルーティングに利用可能。

### RDF/XML Integration Flow
1. **RDF/XML 取り込み**: `const context = await Process.Rpc.importContextFromRdfXml(xmlSource, { namespaces: { foaf: "http://xmlns.com/foaf/0.1/" } });`
2. **RPC メタデータ生成**: `const rpcMap = Process.Rpc.expandContextMap(context["@context"]);`
3. **用途**:
   - JSON-LD context を UI / CLI へ渡す
   - RPC procedure のメタ情報（IRI、datatype）として利用
   - SHACL 変換 (`Shape.fromResource`) と組み合わせて整合性を検証

> RDF/XML はストリーム/文字列どちらからも取り込めます。`importContextFromStream` を使うと外部エンドポイントからの直接読み込みが可能です。

## Comparison with Other Libraries

| Feature | ResourceBox | TypeBox | ShEx | SHACL-JS |
|---------|------------|---------|------|----------|
| TypeScript Support | ✅ Full | ✅ Full | ❌ | ❌ |
| Type Inference | ✅ | ✅ | ❌ | ❌ |
| RDF/OWL Support | ✅ RDFS/OWL Lite | ❌ | ✅ | ✅ |
| Lightweight Reasoning | ✅ RDFS/OWL Lite | ❌ | ❌ | ❌ |
| JSON Schema Validation | ✅ | ✅ | ❌ | ❌ |
| SHACL Validation | ✅ Core | ❌ | Partial | ✅ |
| Neptune SigV4 Client | ✅ | ❌ | ❌ | ❌ |
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

**ResourceBox** = TypeBox-inspired + RDF Resource Type Builder + SHACL Core Validation + RDFS/OWL Lite Reasoning + Neptune SigV4 Client + JSON-LD Context Generation
