# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

