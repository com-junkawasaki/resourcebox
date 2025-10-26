---
title: Shape Layer Overview
description: Define SHACL constraints for semantic validation
---

The Shape layer provides a SHACL-based API for defining semantic constraints. This is where you define **validation rules** and **semantic constraints**.

## Purpose

The Shape layer handles:

- Defining SHACL Node Shapes
- Defining SHACL Property Shapes
- Semantic validation against SHACL constraints
- Auto-generating shapes from Resource definitions
- JSON-LD export of SHACL shapes
- Integration with RDFS/OWL Lite inference

## Core Concepts

### Node Shapes

Define constraints for a class of resources:

```typescript
import { Shape, Onto } from '@gftdcojp/resourcebox';

const PersonShape = Shape.Define({
  targetClass: Person,
  
  property: {
    name: Shape.Property({
      path: foaf("name"),
      datatype: Onto.Datatype.String,
      minCount: 1,
      maxCount: 1
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
```

### Property Shapes

Define constraints for specific properties:

```typescript
const EmailProperty = Shape.Property({
  path: foaf("mbox"),
  datatype: Onto.Datatype.String,
  maxCount: 1,
  pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
});
```

### Validation

Validate data against SHACL shapes:

```typescript
const result = Shape.validate(PersonShape, data);

if (!result.ok) {
  result.violations?.forEach(violation => {
    console.error(violation.message);
  });
}
```

### Auto-Generation

Generate SHACL shapes from Resource definitions:

```typescript
const AutoShape = Shape.fromResource(PersonResource, {
  strict: true
});

// Automatically derives constraints from Resource schema
```

### Inference Integration

Use RDFS/OWL Lite reasoning in validation:

```typescript
const context = Onto.createInferenceContext(classes, properties);

const result = Shape.validate(PersonShape, data, context);
// Validates with inference (subclass relationships, etc.)
```

## API Reference

### Shape.Define()

Define a SHACL Node Shape:

```typescript
Shape.Define(options: {
  targetClass: OntoIRI | OntoClass,
  property?: Record<string, ShapePropertyDef>,
  closed?: boolean,
  ignoredProperties?: OntoIRI[],
  description?: string
}): ShapeNodeDef
```

### Shape.Property()

Define a SHACL Property Shape:

```typescript
Shape.Property(options: {
  path: OntoIRI | OntoProperty,
  datatype?: OntoIRI | OntoDatatype,
  class?: OntoIRI | OntoClass,
  minCount?: number,
  maxCount?: number,
  minLength?: number,
  maxLength?: number,
  pattern?: string,
  minInclusive?: number,
  maxInclusive?: number,
  minExclusive?: number,
  maxExclusive?: number,
  nodeKind?: "IRI" | "Literal" | "BlankNode",
  in?: Array<string | number | boolean | OntoIRI>,
  hasValue?: string | number | boolean | OntoIRI
}): ShapePropertyDef
```

### Shape.fromResource()

Auto-generate SHACL shape from Resource:

```typescript
Shape.fromResource(
  resource: ObjectSchema,
  options?: {
    strict?: boolean
  }
): ShapeNodeDef
```

### Shape.validate()

Validate data against SHACL shape:

```typescript
Shape.validate(
  shape: ShapeNodeDef,
  data: unknown,
  context?: InferenceContext
): ShapeValidationResult
```

### Shape.check()

Boolean validation helper:

```typescript
Shape.check(
  shape: ShapeNodeDef,
  data: unknown,
  context?: InferenceContext
): boolean
```

### Shape.toJsonLd()

Export shape as JSON-LD:

```typescript
Shape.toJsonLd(shape: ShapeNodeDef): Record<string, unknown>
```

## SHACL Constraints

### Cardinality Constraints

```typescript
Shape.Property({
  path: foaf("name"),
  minCount: 1,  // Required
  maxCount: 1   // At most one value
})
```

### Datatype Constraints

```typescript
Shape.Property({
  path: ex("age"),
  datatype: Onto.Datatype.Integer,
  minInclusive: 0,
  maxInclusive: 150
})
```

### String Constraints

```typescript
Shape.Property({
  path: foaf("mbox"),
  datatype: Onto.Datatype.String,
  minLength: 5,
  maxLength: 100,
  pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
})
```

### Value Constraints

```typescript
Shape.Property({
  path: ex("status"),
  in: ["active", "inactive", "pending"]
})

Shape.Property({
  path: ex("type"),
  hasValue: "Person"
})
```

### Logical Constraints

```typescript
Shape.Property({
  path: ex("contact"),
  or: [
    { datatype: Onto.Datatype.String, pattern: "^\\+?[0-9\\-\\s]+$" },
    { datatype: Onto.Datatype.String, format: "email" }
  ]
})
```

## Examples

### Basic Shape Definition

```typescript
const PersonShape = Shape.Define({
  targetClass: foaf("Person"),
  
  property: {
    name: Shape.Property({
      path: foaf("name"),
      datatype: Onto.Datatype.String,
      minCount: 1,
      maxCount: 1
    })
  }
});
```

### Complex Constraints

```typescript
const ProductShape = Shape.Define({
  targetClass: ex("Product"),
  
  property: {
    price: Shape.Property({
      path: ex("price"),
      datatype: Onto.Datatype.Decimal,
      minInclusive: 0,
      minCount: 1
    }),
    
    category: Shape.Property({
      path: ex("category"),
      in: ["electronics", "clothing", "food", "other"],
      minCount: 1
    }),
    
    sku: Shape.Property({
      path: ex("sku"),
      datatype: Onto.Datatype.String,
      pattern: "^[A-Z]{3}-\\d{6}$",
      minCount: 1,
      maxCount: 1
    })
  },
  
  closed: true
});
```

### With Inference

```typescript
const context = Onto.createInferenceContext(
  [
    { iri: ex("Employee"), superClasses: [foaf("Person")] }
  ],
  []
);

const result = Shape.validate(PersonShape, employeeData, context);
// Validates Employee as Person using inference
```

## Next Steps

- [Define](/shape/define/) - Define SHACL Node Shapes
- [Property](/shape/property/) - Define SHACL Property Shapes
- [From Resource](/shape/from-resource/) - Auto-generate shapes
- [Validation](/shape/validation/) - Validate data
- [JSON-LD Export](/shape/jsonld/) - Export shapes as JSON-LD

