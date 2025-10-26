---
title: Migration from v0.3.x
description: Migrate from ResourceBox v0.3.x to v0.4.0
---

ResourceBox v0.4.0 introduces breaking changes to align with the TypeBox design philosophy. This guide helps you migrate from v0.3.x.

## Breaking Changes Overview

### Removed Legacy DSL

The entire `src/core/dsl` layer has been removed:

- ❌ `defineShape()` - Replaced by `Resource.Shaped()` or `Shape.Define()`
- ❌ `iri()`, `classIri()`, `propertyIri()`, `datatypeIri()` - Use `Onto.iri()` or direct IRI strings
- ❌ `cardinality()`, `exactlyOne()`, `optional()`, `oneOrMore()`, `zeroOrMore()` - Use SHACL `minCount`/`maxCount` in `Shape.Property()`
- ❌ `range.datatype()`, `range.shape()` - Use `Shape.Property({ datatype: ... })` or `Shape.Property({ class: ... })`

### Removed Duplicate Context Generation

- ❌ `buildContext()` - Use `Resource.context()`
- ❌ `mergeContexts()`, `extractNamespacePrefixes()` - Handled internally by `Resource.context()`

### Unified Three-Layer API

Public API now strictly follows Onto → Resource → Shape separation.

## Migration Guide

### Before: defineShape()

**Old (v0.3.x):**

```typescript
import { defineShape, iri, cardinality, range } from '@gftdcojp/resourcebox';
import { Type } from '@sinclair/typebox';

const Person = defineShape({
  classIri: iri("ex:Person"),
  schema: Type.Object({
    "@id": Type.String({ format: "uri" }),
    "@type": Type.Array(Type.String({ format: "uri" })),
    email: Type.String({ format: "email" }),
  }),
  props: {
    email: {
      predicate: iri("ex:hasEmail"),
      cardinality: cardinality({ min: 1, max: 1, required: true }),
      range: range.datatype(iri("xsd:string")),
    },
  },
});
```

**New (v0.4.0):**

Option 1: Use `Resource.Shaped()` for unified definition:

```typescript
import { Onto, Resource } from '@gftdcojp/resourcebox';

const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});

const Person = Resource.Shaped({
  class: ex("Person"),
  properties: {
    email: Resource.String({
      property: ex("hasEmail"),
      format: "email",
      required: true
    })
  },
  shape: {
    closed: true
  }
});
```

Option 2: Use separate layers for more control:

```typescript
import { Onto, Resource, Shape } from '@gftdcojp/resourcebox';

// 1. Define Resource
const PersonResource = Resource.Object({
  "@id": Resource.String({ format: "uri" }),
  "@type": Resource.Literal([ex("Person")]),
  email: Resource.String({
    property: ex("hasEmail"),
    format: "email",
    required: true
  })
});

// 2. Define Shape
const PersonShape = Shape.Define({
  targetClass: ex("Person"),
  property: {
    email: Shape.Property({
      path: ex("hasEmail"),
      datatype: Onto.Datatype.String,
      minCount: 1,
      maxCount: 1
    })
  }
});
```

### Before: buildContext()

**Old (v0.3.x):**

```typescript
import { buildContext } from '@gftdcojp/resourcebox';

const context = buildContext([Person, Project], {
  includeNamespaces: true,
  namespaces: { ex: "http://example.org/" }
});
```

**New (v0.4.0):**

```typescript
import { Resource } from '@gftdcojp/resourcebox';

const context = Resource.context(PersonResource, {
  includeNamespaces: true,
  namespaces: { ex: "http://example.org/" }
});
```

### Before: IRI Helpers

**Old (v0.3.x):**

```typescript
import { iri, classIri, propertyIri } from '@gftdcojp/resourcebox';

const personIri = classIri("ex:Person");
const nameIri = propertyIri("ex:name");
```

**New (v0.4.0):**

```typescript
import { Onto } from '@gftdcojp/resourcebox';

const ex = Onto.Namespace({
  prefix: "ex",
  uri: "http://example.org/"
});

const personIri = ex("Person");
const nameIri = ex("name");

// Or use Onto.iri() for direct IRI creation
const personIri2 = Onto.iri("ex:Person");
```

### Before: Cardinality

**Old (v0.3.x):**

```typescript
import { cardinality, exactlyOne, optional } from '@gftdcojp/resourcebox';

props: {
  email: {
    cardinality: exactlyOne(),
    // or
    cardinality: cardinality({ min: 1, max: 1, required: true }),
  }
}
```

**New (v0.4.0):**

```typescript
import { Shape, Onto } from '@gftdcojp/resourcebox';

property: {
  email: Shape.Property({
    path: ex("hasEmail"),
    datatype: Onto.Datatype.String,
    minCount: 1,
    maxCount: 1
  })
}
```

### Before: Range

**Old (v0.3.x):**

```typescript
import { range } from '@gftdcojp/resourcebox';

props: {
  email: {
    range: range.datatype(iri("xsd:string"))
  },
  manager: {
    range: range.shape("ex:Person")
  }
}
```

**New (v0.4.0):**

```typescript
import { Shape, Onto } from '@gftdcojp/resourcebox';

property: {
  email: Shape.Property({
    path: ex("hasEmail"),
    datatype: Onto.Datatype.String
  }),
  manager: Shape.Property({
    path: ex("hasManager"),
    class: ex("Person")
  })
}
```

## Inference API Changes

**Old (v0.3.x):**

```typescript
import { createInferenceContext } from '@gftdcojp/resourcebox';

const context = createInferenceContext(...);
```

**New (v0.4.0):**

Inference API is now properly exposed:

```typescript
import { Onto } from '@gftdcojp/resourcebox';

// Via Onto namespace
const context = Onto.createInferenceContext(...);

// Or top-level import (for backward compatibility)
import { createInferenceContext } from '@gftdcojp/resourcebox';
const context = createInferenceContext(...);
```

Additional inference helpers are now available:

```typescript
Onto.isSubClassOf(context, subClass, superClass);
Onto.areEquivalentClasses(context, class1, class2);
Onto.getInverseProperty(context, property);
Onto.getAllSuperClasses(context, classIri);
```

## Step-by-Step Migration

1. **Update imports:**
   ```typescript
   // Remove
   import { defineShape, iri, cardinality, range, buildContext } from '@gftdcojp/resourcebox';
   
   // Add
   import { Onto, Resource, Shape } from '@gftdcojp/resourcebox';
   ```

2. **Replace `defineShape()` with `Resource.Shaped()` or separate layers**

3. **Replace `buildContext()` with `Resource.context()`**

4. **Replace IRI helpers with `Onto.Namespace()` or `Onto.iri()`**

5. **Replace cardinality/range with SHACL Property constraints**

6. **Update tests**

7. **Run linter and tests to catch any issues**

## Need Help?

- Review the [Quick Start Guide](/quick-start/)
- Check [API documentation](/onto/overview/)
- See [Examples](/examples/basic/)
- Open an issue on [GitHub](https://github.com/gftdcojp/resourcebox/issues)

