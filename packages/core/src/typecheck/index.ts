// DAG: core-typecheck
// Type-level integrity checks export index

export type {
  ValidateCardinalityOptional,
  ValidateAllCardinalityOptional,
  CardinalityOptionalError,
} from "./cardinality-optional.ts";

export type { ValidateRangeExclusivity } from "./range-exclusivity.ts";
export { validateRangeExclusivityRuntime } from "./range-exclusivity.ts";

export type {
  ValidateExtendsCircular,
  ExtendsCircularError,
} from "./extends-circular.ts";
export { validateExtendsCircularRuntime } from "./extends-circular.ts";

export type {
  ValidatePropsSchemaConsistency,
  ExtraPropsKeys,
  PropsSchemaConsistencyError,
} from "./props-schema-consistency.ts";
export { validatePropsSchemaConsistencyRuntime } from "./props-schema-consistency.ts";

