---
title: Onto Layer Overview
description: Define RDF vocabularies with OWL/RDFS
---

The Onto layer provides a clean API for defining RDF vocabularies using OWL/RDFS. This is where you define **what things are** and **how they relate**.

## Purpose

The Onto layer handles:

- Creating RDF namespaces
- Defining OWL/RDFS classes
- Defining properties with characteristics (functional, transitive, etc.)
- Defining XSD datatypes
- Creating class expressions (unions, intersections)
- Lightweight RDFS/OWL Lite reasoning

## Core Concepts

### Namespaces

Create namespace functions to build IRIs:

```typescript
import { Onto } from '@gftdcojp/resourcebox';

const foaf = Onto.Namespace({
  prefix: "foaf",
  uri: "http://xmlns.com/foaf/0.1/"
});

const personIRI = foaf("Person");  // "http://xmlns.com/foaf/0.1/Person"
```

**Built-in namespaces:**
- `Onto.RDF` - RDF vocabulary
- `Onto.RDFS` - RDFS vocabulary
- `Onto.OWL` - OWL vocabulary
- `Onto.XSD` - XSD datatypes
- `Onto.FOAF` - Friend of a Friend

### Classes

Define OWL/RDFS classes:

```typescript
const Person = Onto.Class({
  iri: foaf("Person"),
  label: "Person",
  comment: "A human being",
  subClassOf: [foaf("Agent")]
});
```

### Properties

Define properties with OWL characteristics:

```typescript
const knows = Onto.Property({
  iri: foaf("knows"),
  label: "knows",
  domain: [Person],
  range: [Person],
  symmetric: true  // If A knows B, then B knows A
});

const age = Onto.Property({
  iri: ex("age"),
  domain: [Person],
  range: [Onto.Datatype.Integer],
  functional: true  // Each person has at most one age
});
```

**OWL characteristics:**
- `functional` - At most one value
- `inverseFunctional` - Uniquely identifies the subject
- `transitive` - If A→B and B→C, then A→C
- `symmetric` - If A→B, then B→A
- `inverseOf` - Defines inverse relationship

### Datatypes

Use built-in XSD datatypes:

```typescript
Onto.Datatype.String
Onto.Datatype.Integer
Onto.Datatype.Boolean
Onto.Datatype.Date
Onto.Datatype.DateTime
Onto.Datatype.Decimal
Onto.Datatype.Float
Onto.Datatype.Double
// ... and more
```

### Inference

Create inference contexts for RDFS/OWL Lite reasoning:

```typescript
const context = Onto.createInferenceContext(
  [
    { iri: Person.iri, superClasses: [foaf("Agent")] },
    { iri: foaf("Agent"), superClasses: [] }
  ],
  [
    { iri: knows.iri, symmetric: true }
  ]
);

// Check subclass relationships
Onto.isSubClassOf(context, Person.iri, foaf("Agent")); // true

// Get all superclasses
const superClasses = Onto.getAllSuperClasses(context, Person.iri);
```

## API Reference

### Onto.Namespace()

Create a namespace function.

```typescript
const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});
```

### Onto.Class()

Define an OWL/RDFS class.

```typescript
const Person = Onto.Class({
  iri: ex("Person"),
  label?: string,
  comment?: string,
  subClassOf?: OntoIRI[],
  equivalentClass?: ClassExpression[]
});
```

### Onto.Property()

Define an RDF property.

```typescript
const hasEmail = Onto.Property({
  iri: ex("hasEmail"),
  label?: string,
  comment?: string,
  domain?: OntoIRI[],
  range?: OntoIRI[],
  functional?: boolean,
  inverseFunctional?: boolean,
  transitive?: boolean,
  symmetric?: boolean,
  inverseOf?: OntoIRI
});
```

### Onto.createInferenceContext()

Create an inference context for reasoning.

```typescript
const context = Onto.createInferenceContext(
  classDefs: Array<{
    iri: string,
    superClasses?: string[],
    equivalentClasses?: string[]
  }>,
  propertyDefs: Array<{
    iri: string,
    superProperties?: string[],
    domain?: string[],
    range?: string[],
    inverseOf?: string
  }>
);
```

## Examples

### Define a Simple Ontology

```typescript
import { Onto } from '@gftdcojp/resourcebox';

const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});

const Person = Onto.Class({
  iri: ex("Person"),
  label: "Person"
});

const Organization = Onto.Class({
  iri: ex("Organization"),
  label: "Organization"
});

const worksFor = Onto.Property({
  iri: ex("worksFor"),
  domain: [Person],
  range: [Organization]
});
```

### Use Class Expressions

```typescript
const ActivityOrCapability = Onto.Expressions.Union([
  ex("Activity"),
  ex("Capability")
]);

const Artifact = Onto.Class({
  iri: ex("Artifact"),
  equivalentClass: [ActivityOrCapability]
});
```

### Export as JSON-LD

```typescript
const ontology = Onto.OntologyContainer({
  iri: ex("myOntology"),
  classes: [Person, Organization],
  properties: [worksFor]
});

const jsonld = Onto.toJsonLd(ontology);
```

## Next Steps

- [Namespace](/onto/namespace/) - Create and use namespaces
- [Class](/onto/class/) - Define OWL/RDFS classes
- [Property](/onto/property/) - Define properties with characteristics
- [Datatype](/onto/datatype/) - Work with XSD datatypes
- [Inference](/onto/inference/) - Use RDFS/OWL Lite reasoning

