// DAG: core-api
// defineShape: main API for creating type-safe shape definitions

import type { TObject } from "@sinclair/typebox";
import {
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "../typecheck/index.js";
import { getIRILocalName } from "../types/iri.js";
import type { PropertyMeta } from "../types/property.js";
import { validatePropertyMeta } from "../types/property.js";
import type { Shape, ShapeDefinition } from "../types/shape.js";

/**
 * Define a Shape with compile-time type safety.
 *
 * This is the main API for creating shape definitions in ResourceBox.
 * It enforces runtime consistency checks and returns a Shape object
 * that can be used for validation and context generation.
 *
 * @template TDef - ShapeDefinition type (inferred from argument)
 * @param definition - Shape definition with schema, props, and metadata
 * @returns Shape object with shapeId
 * @throws Error if runtime validation fails
 *
 * @example
 * ```ts
 * import { Type } from "@sinclair/typebox";
 * import { defineShape, iri, cardinality, range } from "@gftdcojp/resourcebox";
 *
 * const Person = defineShape({
 *   classIri: iri("ex:Person"),
 *   schema: Type.Object({
 *     "@id": Type.String({ format: "uri" }),
 *     "@type": Type.Array(Type.String({ format: "uri" }), { minItems: 1 }),
 *     email: Type.String({ format: "email" }),
 *     manager: Type.Optional(Type.String({ format: "uri" })),
 *   }),
 *   props: {
 *     email: {
 *       predicate: iri("ex:hasEmail"),
 *       cardinality: cardinality({ min: 1, max: 1, required: true }),
 *       range: range.datatype(iri("xsd:string")),
 *     },
 *     manager: {
 *       predicate: iri("ex:hasManager"),
 *       cardinality: cardinality({ min: 0, max: 1, required: false }),
 *       range: range.shape("ex:Person"),
 *     },
 *   },
 *   extends: [iri("ex:Agent")],
 *   description: "A person entity",
 * });
 * ```
 */
export function defineShape<TDef extends ShapeDefinition>(
  definition: TDef
): Shape<TDef extends ShapeDefinition<infer TSchema> ? TSchema : TObject> {
  // Runtime validations

  // 1. Validate extends (no self-reference)
  const extendsError = validateExtendsCircularRuntime(definition.classIri, definition.extends);
  if (extendsError) {
    throw new Error(`Shape definition error: ${extendsError}`);
  }

  // 2. Validate props-schema consistency
  const schemaKeys = Object.keys(definition.schema.properties);
  const propsKeys = Object.keys(definition.props);
  const propsError = validatePropsSchemaConsistencyRuntime(schemaKeys, propsKeys);
  if (propsError) {
    throw new Error(`Shape definition error: ${propsError}`);
  }

  // 3. Validate each PropertyMeta
  for (const [key, meta] of Object.entries(definition.props)) {
    if (meta) {
      const metaError = validatePropertyMeta(meta as PropertyMeta);
      if (metaError) {
        throw new Error(`Property '${key}' meta error: ${metaError}`);
      }
    }
  }

  // Generate shapeId if not provided
  const shapeId = definition.shapeId ?? getIRILocalName(definition.classIri);

  return {
    ...definition,
    shapeId,
  } as unknown as Shape<TDef extends ShapeDefinition<infer TSchema> ? TSchema : TObject>;
}

/**
 * Type helper to extract Shape type from defineShape call.
 *
 * @example
 * ```ts
 * const Person = defineShape({ ... });
 * type PersonShape = typeof Person;
 * // or
 * type PersonShape = DefineShape<typeof personDefinition>;
 * ```
 */
export type DefineShape<TDef extends ShapeDefinition> = ReturnType<typeof defineShape<TDef>>;
