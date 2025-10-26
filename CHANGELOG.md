# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-10-26

### Design Philosophy

ResourceBox now fully aligns with the TypeBox design philosophy adapted to the semantic web:

**"TS静的型×RDF/OWL/SHACL、関数合成、標準準拠のランタイム検証"**

- Unify TypeScript static types with RDF, OWL, and SHACL
- Compose schemas functionally
- Validate at runtime against open standards

Inspired by [TypeBox](https://github.com/sinclairzx81/typebox).

### Breaking Changes

- **Removed legacy DSL API**: The entire `src/core/dsl` layer has been removed
  - **REMOVED**: `defineShape()` - Use `Resource.Shaped()` or `Shape.Define()` + `Shape.fromResource()` instead
  - **REMOVED**: `iri()`, `classIri()`, `propertyIri()`, `datatypeIri()` - Use `Onto.iri()` or direct IRI strings
  - **REMOVED**: `cardinality()`, `exactlyOne()`, `optional()`, `oneOrMore()`, `zeroOrMore()` - Use SHACL `minCount`/`maxCount` in `Shape.Property()`
  - **REMOVED**: `range.datatype()`, `range.shape()` - Use `Shape.Property({ datatype: ... })` or `Shape.Property({ class: ... })`

- **Removed duplicate context generation**: `buildContext()` from `src/core/context` has been removed
  - **Use instead**: `Resource.context()` for unified JSON-LD context generation
  - **REMOVED**: `mergeContexts()`, `extractNamespacePrefixes()` - Now handled internally by `Resource.context()`

- **Unified three-layer API**: Public API now strictly follows Onto → Resource → Shape separation
  - Use `Onto.*` for vocabulary (classes, properties, namespaces)
  - Use `Resource.*` for data structure (TypeBox-like schemas)
  - Use `Shape.*` for constraints (SHACL validation)

### Added

- **Inference API exposure**: `createInferenceContext` is now properly exposed
  - Available as `Onto.createInferenceContext()`
  - Also exported at top level: `import { createInferenceContext } from '@gftdcojp/resourcebox'`
  - Includes helper functions: `isSubClassOf`, `areEquivalentClasses`, `getInverseProperty`, `getAllSuperClasses`

- **Design Philosophy section** in README documenting the TypeBox-inspired approach

### Migration Guide

**Before (v0.2.x with legacy DSL):**
```typescript
import { defineShape, iri, cardinality, range } from '@gftdcojp/resourcebox';

const Person = defineShape({
  classIri: iri("ex:Person"),
  schema: Type.Object({
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

**After (v0.4.0 with three-layer API):**
```typescript
import { Onto, Resource, Shape } from '@gftdcojp/resourcebox';

const ex = Onto.Namespace({ prefix: "ex", uri: "http://example.org/" });

const PersonResource = Resource.Shaped({
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

// Or use Shape.Define() for more control:
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

## [0.2.0] - 2025-01-24

### Added

- **TypeBox-inspired API**: New three-layer architecture for semantic web development
  - `Onto.*` - OWL/RDFS ontology layer for vocabulary definition
  - `Resource.*` - TypeBox-like data structure definition layer
  - `Shape.*` - SHACL constraint layer for semantic validation
  
- **Onto Layer**:
  - `Onto.Namespace()` - Create RDF namespaces
  - `Onto.Class()` - Define OWL/RDFS classes
  - `Onto.Property()` - Define RDF properties with OWL characteristics
  - `Onto.Datatype.*` - Built-in XSD datatypes (String, Integer, Boolean, Date, DateTime, etc.)
  - Pre-defined namespaces: `Onto.FOAF`, `Onto.RDF`, `Onto.RDFS`, `Onto.OWL`, `Onto.XSD`

- **Resource Layer**:
  - `Resource.String()`, `Resource.Number()`, `Resource.Boolean()` - Primitive types
  - `Resource.Object()` - Object schema definition (TypeBox-compatible)
  - `Resource.Array()` - Array schema definition
  - `Resource.Ref()` - IRI references to other resources
  - `Resource.Literal()` - Constant values (e.g., for @type)
  - `Resource.Optional()` - Optional wrapper
  - `Resource.Static<T>` - TypeScript type inference (like TypeBox)
  - `Resource.validate()` - Structural validation using Ajv
  - `Resource.check()`, `Resource.parse()` - Alternative validation methods
  - `Resource.context()` - Automatic JSON-LD @context generation
  - `Resource.extractNamespaces()` - Namespace extraction helper

- **Shape Layer**:
  - `Shape.Define()` - Define SHACL Node Shapes
  - `Shape.Property()` - Define SHACL Property Shapes
  - `Shape.fromResource()` - Auto-generate SHACL shapes from Resource definitions
  - `Shape.validate()` - Semantic validation against SHACL constraints
  - `Shape.check()` - Boolean validation helper

- **Integrated API**:
  - `Resource.Shaped()` - Combine all three layers in a single definition

### Features

- **Full TypeScript Type Safety**: Compile-time type checking with `exactOptionalPropertyTypes`
- **Dual Validation**: Both structural (JSON Schema via Ajv) and semantic (SHACL) validation
- **Fluent, Composable API**: Chain methods and compose complex schemas from simple parts
- **Progressive Enhancement**: Use as much or as little of the API as needed
- **Automatic Context Generation**: Generate JSON-LD @context from Resource definitions
- **142 Tests**: Comprehensive test coverage for all layers

### Changed

- Package renamed from `@gftdcojp/shapebox` to `@gftdcojp/resourcebox`
- README completely rewritten with new API examples
- Improved type safety with `exactOptionalPropertyTypes: true`

### Maintained

- Existing `defineShape()` API and validation functions remain available
- All existing tests continue to pass (16 test suites, 142 tests)
- Backward compatibility for current users

### Technical

- Built with TypeScript 5.7.2
- Uses TypeBox 0.32.35 for schema validation
- Uses Ajv 8.17.1 with format validation
- Full ESM support

## [0.1.1] - Previous Release

Initial release with basic RDF shape definition and validation capabilities.

- `defineShape()` API
- Structure validation (Ajv)
- Shape validation (SHACL-lite)
- JSON-LD context generation

---

[0.2.0]: https://github.com/gftdcojp/resourcebox/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/gftdcojp/resourcebox/releases/tag/v0.1.1

