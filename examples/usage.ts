// DAG: examples
// Complete usage example demonstrating the shapebox workflow

import { buildContext } from "@gftdcojp/shapebox-core";
import { validateStruct, validateShape } from "@gftdcojp/shapebox-validate";
import { Person, johnDoe, invalidPerson } from "./person.ts";
import { Project, alphaProject } from "./project.ts";

// ============================================================================
// 1. Build JSON-LD Context
// ============================================================================

console.log("=== Building JSON-LD Context ===");

const context = buildContext([Person, Project], {
  includeNamespaces: true,
  namespaces: {
    ex: "http://example.org/",
    xsd: "http://www.w3.org/2001/XMLSchema#",
  },
});

console.log("Generated context:");
console.log(JSON.stringify(context, null, 2));

// This context can be used for:
// - Comunica + GraphQL-LD query translation
// - Data serialization/deserialization
// - IRI aliasing in client code

// ============================================================================
// 2. Structure Validation (Ajv-based)
// ============================================================================

console.log("\n=== Structure Validation ===");

// Valid data
const structResult1 = validateStruct(Person, johnDoe);
console.log("Valid person - struct validation:", structResult1.ok);

// Invalid data (missing required field)
const structResult2 = validateStruct(Person, invalidPerson);
console.log("Invalid person - struct validation:", structResult2.ok);
if (!structResult2.ok) {
  console.log("Structure errors:", structResult2.errors);
}

// ============================================================================
// 3. Shape Validation (ShEx-like)
// ============================================================================

console.log("\n=== Shape Validation ===");

// Valid data
const shapeResult1 = validateShape(Person, johnDoe);
console.log("Valid person - shape validation:", shapeResult1.ok);

// Invalid data
const shapeResult2 = validateShape(Person, invalidPerson);
console.log("Invalid person - shape validation:", shapeResult2.ok);
if (!shapeResult2.ok) {
  console.log("Shape violations:", shapeResult2.violations);
}

// Project validation
const projectShapeResult = validateShape(Project, alphaProject);
console.log("Valid project - shape validation:", projectShapeResult.ok);

// ============================================================================
// 4. Combined Workflow (Structure + Shape)
// ============================================================================

console.log("\n=== Combined Validation Workflow ===");

function validateNode(shape: typeof Person | typeof Project, data: unknown): boolean {
  // Step 1: Structure validation
  const structResult = validateStruct(shape, data);
  if (!structResult.ok) {
    console.error("Structure validation failed:", structResult.errors);
    return false;
  }
  
  // Step 2: Shape validation
  const shapeResult = validateShape(shape, data);
  if (!shapeResult.ok) {
    console.error("Shape validation failed:", shapeResult.violations);
    return false;
  }
  
  console.log("✓ Node passed all validations");
  return true;
}

console.log("Validating johnDoe:");
validateNode(Person, johnDoe);

console.log("\nValidating alphaProject:");
validateNode(Project, alphaProject);

console.log("\nValidating invalidPerson:");
validateNode(Person, invalidPerson);

// ============================================================================
// 5. Summary
// ============================================================================

console.log("\n=== Summary ===");
console.log("Shapebox provides:");
console.log("1. Type-safe shape definitions (defineShape)");
console.log("2. JSON-LD context generation (buildContext)");
console.log("3. Structure validation (validateStruct with Ajv)");
console.log("4. Shape validation (validateShape with cardinality/range checks)");
console.log("\nShapebox does NOT:");
console.log("- Perform OWL reasoning or inference");
console.log("- Execute SPARQL queries");
console.log("- Validate external IRI references (no I/O)");
console.log("- Handle data fetching (use Comunica + GraphQL-LD for that)");

