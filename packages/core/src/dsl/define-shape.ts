// DAG: core-api
// defineShape: main API for creating type-safe shape definitions

import type { TObject, TProperties } from "@sinclair/typebox";
import type { IRI } from "../types/iri.ts";
import type { PropertyMeta } from "../types/property.ts";
import type { Shape, ShapeDefinition } from "../types/shape.ts";
import {
  validateExtendsCircularRuntime,
  validatePropsSchemaConsistencyRuntime,
} from "../typecheck/index.ts";
import { validatePropertyMeta } from "../types/property.ts";
import { getIRILocalName } from "../types/iri.ts";

/**
 * Type-level validation for ShapeDefinition.
 * This ensures compile-time safety for:
 * - Cardinality-optional consistency
 * - Props-schema key consistency
 * - Extends circular reference (1 level)
 * 
 * @template TDef - ShapeDefinition to validate
 */
type ValidateShapeDefinition<TDef extends ShapeDefinition> = TDef extends ShapeDefinition<
  infer TSchema
>
  ? TSchema extends TObject
    ? {
        // Validate props keys exist in schema
        readonly propsValid: ValidatePropsKeys<TProperties<TSchema>, TDef["props"]>;
        // Validate extends is not circular (self-reference)
        readonly extendsValid: ValidateExtends<TDef["classIri"], TDef["extends"]>;
      }
    : never
  : never;

type ValidatePropsKeys<
  TProps extends TProperties,
  TMetas extends ShapeDefinition["props"],
> = {
  [K in keyof TMetas]: K extends keyof TProps | "@id" | "@type" | "@context"
    ? void
    : `Property '${K & string}' in props does not exist in schema`;
}[keyof TMetas] extends void
  ? void
  : never;

type ValidateExtends<
  TClassIri extends IRI<"Class">,
  TExtends extends ShapeDefinition["extends"],
> = TExtends extends ReadonlyArray<IRI<"Class">>
  ? TClassIri extends TExtends[number]
    ? `Class ${TClassIri} extends itself (circular reference)`
    : void
  : void;

/**
 * Define a Shape with compile-time type safety.
 * 
 * This is the main API for creating shape definitions in shapebox.
 * It enforces type-level consistency checks and returns a Shape object
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
 * import { defineShape, iri, cardinality, range } from "@gftdcojp/shapebox-core";
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
  definition: TDef & ValidateShapeDefinition<TDef>
): Shape<TDef extends ShapeDefinition<infer TSchema> ? TSchema : never> {
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
  } as Shape<TDef extends ShapeDefinition<infer TSchema> ? TSchema : never>;
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

